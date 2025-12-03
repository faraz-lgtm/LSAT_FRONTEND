# Chat Email Implementation Guide

## Overview

The chat system uses a dual-channel model supporting both SMS/WhatsApp (via Twilio) and Email (via SendGrid + database storage). This document outlines how email functionality is implemented in the frontend and how it aligns with the backend API.

## Architecture

### Email Conversations
- **Storage**: Database-only (not in Twilio)
- **Identification**: `twilioConversationSid` is `null` for EMAIL conversations
- **Messages**: Stored in `chat_messages` table with `channel: 'EMAIL'`
- **Thread Model**: Each user pair has one thread with multiple channels (SMS + EMAIL)

### Thread-Based Model
- Thread ID format: `thread:{userId1}:{userId2}` (sorted IDs)
- Frontend groups by `threadId` to show unified conversations
- Both SMS and EMAIL messages appear in the same thread view
- Each thread has a `channels` array with conversation SIDs per channel

## Frontend Implementation

### API Endpoints Used

#### 1. List Conversations
```typescript
GET /api/v1/chat/conversations?limit=50
```
- Returns: `ThreadConversationOutputDto[]`
- Each thread contains `channels` array with conversation SIDs for SMS and EMAIL

#### 2. Get Conversation Messages
```typescript
GET /api/v1/chat/conversations/:sid/messages?limit=50&order=desc&channel=EMAIL
```
- Query params: `limit`, `order` (asc/desc), `channel` (SMS/EMAIL/WHATSAPP)
- Returns: `MessageOutputDto[]`
- For EMAIL conversations: Fetches from database
- For SMS conversations: Fetches from Twilio API
- Can filter by channel to show only EMAIL or SMS messages

#### 3. Send Email
```typescript
POST /api/v1/chat/conversations/:sid/emails
```
- Body: `SendEmailDto`
- Finds/creates EMAIL conversation if needed
- Sends via SendGrid
- Stores message in database
- Returns: `SuccessResponseDto`

#### 4. Send Message (Generic)
```typescript
POST /api/v1/chat/conversations/:sid/messages
```
- Body: `SendMessageDto` with `channel: 'EMAIL'`
- Can be used for EMAIL messages, but `POST /emails` is preferred

### SendEmailDto Structure

```typescript
interface SendEmailDto {
  to?: string;              // Auto-populated from conversation if not provided
  subject?: string;         // Defaults to "Chat-BetterLSAT" if not provided
  text?: string;           // Plain text content
  html?: string;           // HTML content
  from?: string;           // Auto-populated from current user if not provided
  cc?: string[];           // CC recipients
  bcc?: string[];          // BCC recipients
  attachments?: EmailAttachmentDto[]; // Email attachments
}
```

**Important Notes:**
- All fields are optional
- Backend auto-populates `to` from conversation participants
- Backend auto-populates `from` from current logged-in user
- Subject defaults to "Chat-BetterLSAT" if not provided
- Backend will find or create EMAIL conversation automatically

### Frontend Code Structure

#### 1. Chat API Slice (`src/redux/apiSlices/Chat/chatSlice.ts`)

```typescript
// Send email mutation
sendEmail: builder.mutation<
  BaseApiResponse<void>,
  { conversationSid: string; data: SendEmailDto }
>({
  query: ({ conversationSid, data }) => ({
    url: `chat/conversations/${conversationSid}/emails`,
    method: 'POST',
    body: data,
  }),
  invalidatesTags: ['Chat'],
})
```

#### 2. Email Sending Handler (`src/features/dashboardRelated/chats/index.tsx`)

```typescript
const handleSendEmail = async (email: {
  fromName: string
  fromEmail: string
  to: string
  cc?: string
  bcc?: string
  subject: string
  body: string
}) => {
  // Get EMAIL channel's conversation SID from thread structure
  let conversationSid = currentConversation.id
  if (currentConversation.channels && currentConversation.channels.length > 0) {
    const emailChannel = currentConversation.channels.find(
      (c) => c.channel === 'Email' || c.channel === 'EMAIL'
    )
    if (emailChannel) {
      conversationSid = emailChannel.conversationSid
    }
  }

  await sendEmailMutation({
    conversationSid,
    data: {
      to: email.to || undefined,
      subject: email.subject || undefined,
      html: email.body,
      from: email.fromEmail || undefined,
      cc: email.cc ? [email.cc] : undefined,
      bcc: email.bcc ? [email.bcc] : undefined,
    },
  }).unwrap()
}
```

#### 3. Channel Conversion (`src/utils/chat-channel.ts`)

```typescript
// Backend uses 'EMAIL' (all caps)
// Frontend uses 'Email' (capitalized)
export function toBackendChannel(channel: MessageChannel): BackendChannel {
  return channel === 'Email' ? 'EMAIL' : 'SMS'
}

export function toFrontendChannel(channel: BackendChannel | string): MessageChannel {
  return channel === 'EMAIL' ? 'Email' : 'SMS'
}
```

#### 4. Thread to ChatUser Adapter (`src/services/chat/chat-adapters.ts`)

```typescript
export function convertThreadToChatUser(
  thread: ThreadConversationOutputDto,
  currentUserId?: number | string,
): ChatUser {
  // Find EMAIL channel
  const emailChannel = thread.channels.find((c) => c.channel === 'EMAIL')
  
  return {
    id: primaryChannel?.conversationSid || thread.threadId,
    threadId: thread.threadId,
    channels: thread.channels.map((c) => ({
      channel: toFrontendChannel(c.channel), // 'EMAIL' -> 'Email'
      conversationSid: c.conversationSid,
    })),
    // ... other fields
  }
}
```

## Email Flow

### Outbound Email (Sending)

1. User types email in `EmailComposer` component
2. `handleSendEmail` is called with email data
3. Frontend finds EMAIL channel's conversation SID from thread structure
4. If no EMAIL channel exists, uses primary conversation SID (backend will create one)
5. Calls `POST /api/v1/chat/conversations/:sid/emails` with `SendEmailDto`
6. Backend:
   - Finds or creates EMAIL conversation
   - Sends email via SendGrid
   - Stores message in database
   - Emits WebSocket event
7. Frontend receives WebSocket event and updates UI

### Inbound Email (Receiving)

1. SendGrid webhook receives email at `POST /api/v1/chat/webhooks/sendgrid/inbound`
2. Backend:
   - Parses email
   - Identifies organization by email hostname
   - Finds or creates EMAIL conversation
   - Stores message in database
   - Emits WebSocket event
3. Frontend receives WebSocket event and updates UI

### Channel Switching

When user switches between SMS and EMAIL channels:

1. `setActiveChannel` is called with new channel
2. Frontend finds conversation SID for that channel from thread structure
3. Updates `selectedConversationSid` to use channel-specific SID
4. RTK Query automatically refetches messages with channel filter
5. Messages are filtered by channel in the query: `channel=EMAIL` or `channel=SMS`

## Key Implementation Details

### 1. Conversation SID Resolution

For thread-based conversations, always use the channel-specific conversation SID:

```typescript
// Get conversation SID for active channel
let conversationSid = currentConversation.id
if (currentConversation.channels && currentConversation.channels.length > 0) {
  const channelInfo = currentConversation.channels.find(
    (c) => c.channel === activeChannel // 'Email' or 'SMS'
  )
  if (channelInfo) {
    conversationSid = channelInfo.conversationSid
  }
}
```

### 2. Message Filtering

Messages are filtered by channel in the API query:

```typescript
useGetConversationHistoryQuery(
  { 
    sid: selectedConversationSid!, 
    limit: 50, 
    order: 'desc', 
    channel: activeChannelState // 'EMAIL' or 'SMS'
  },
  { skip: !selectedConversationSid || !accessToken }
)
```

### 3. WebSocket Events

Email messages trigger the same WebSocket events as SMS:
- `message:received` - New message received
- `message:sent` - Message sent confirmation
- `conversation:updated` - Conversation metadata updated

### 4. Real-time Updates

When an email is sent or received:
1. Backend stores message in database
2. Backend emits WebSocket event
3. Frontend receives event and updates message list
4. Conversation list is updated with latest message preview

## Testing

### Manual Testing Checklist

- [ ] Send email via EmailComposer
- [ ] Verify email appears in message thread
- [ ] Switch between SMS and EMAIL channels
- [ ] Verify messages are filtered by channel
- [ ] Test with conversation that has no EMAIL channel (should create one)
- [ ] Test with empty `to` field (backend should auto-populate)
- [ ] Test with empty `subject` field (should default to "Chat-BetterLSAT")
- [ ] Verify WebSocket events update UI in real-time

## API Summary

### Chat Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/chat/conversations` | List all conversations (thread-based) |
| GET | `/chat/conversations/:sid` | Get conversation details |
| GET | `/chat/conversations/:sid/messages` | Get messages (filter by channel) |
| POST | `/chat/conversations` | Create new conversation |
| POST | `/chat/conversations/:sid/messages` | Send message (generic, with channel) |
| POST | `/chat/conversations/:sid/emails` | **Send email (preferred for emails)** |
| DELETE | `/chat/conversations/:sid` | Delete conversation |

### Webhook Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/chat/webhooks/sendgrid/inbound` | Receive inbound emails |
| POST | `/chat/webhooks/twilio` | Receive Twilio events |

## Notes

- EMAIL conversations are database-only (not in Twilio)
- Thread model groups SMS and EMAIL in unified view
- Backend auto-populates email fields from conversation/current user
- Channel filtering ensures messages are shown in correct channel tab
- WebSocket events provide real-time updates for both SMS and EMAIL


