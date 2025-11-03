# Minimal Backend API Specification for Twilio Chat

This document outlines the **minimum** backend APIs needed to support the frontend chat system with Twilio integration.

## Base URL
All REST endpoints: `/api/v1/chat`  
WebSocket: `/chat` (Socket.io namespace)

## Authentication
- **REST API**: JWT token in `Authorization: Bearer <token>` header
- **WebSocket**: JWT token in connection `auth.token` object

---

## 1. REST API Endpoints

### 1.1 List Conversations
**GET** `/conversations`

**Query Parameters:**
```typescript
{
  limit?: number; // Default: 50
  filter?: 'unread' | 'recents' | 'starred' | 'all'; // Optional
  search?: string; // Optional search
}
```

**Response:**
```typescript
Conversation[]
```

**Conversation Object:**
```typescript
{
  sid: string; // Twilio Conversation SID (CHxxx...)
  accountSid: string;
  chatServiceSid: string;
  friendlyName: string; // Contact name
  uniqueName?: string;
  attributes: string; // JSON string containing: { channel, unreadCount, isStarred, contactDetails }
  state: 'active' | 'closed' | 'inactive';
  dateCreated: Date;
  dateUpdated: Date;
  participants?: Participant[];
  latestMessage?: Message;
}
```

**Notes:**
- Store custom fields (channel, unreadCount, isStarred, contactDetails) in `attributes` JSON
- Parse `attributes` in frontend if needed
- Filter `unread`/`starred` client-side or server-side based on `attributes`

### 1.2 Get Conversation
**GET** `/conversations/:sid`

**Response:**
```typescript
Conversation
```

### 1.3 Get Conversation Messages
**GET** `/conversations/:sid/messages`

**Query Parameters:**
```typescript
{
  limit?: number; // Default: 50
  order?: 'asc' | 'desc'; // Default: 'desc'
}
```

**Response:**
```typescript
Message[]
```

**Message Object:**
```typescript
{
  sid: string; // Twilio Message SID (IMxxx...)
  index: number; // Message index for ordering
  author: string; // User ID or phone/email
  body: string;
  attributes: string; // JSON string: { channel, status, twilioMessageId }
  dateCreated: Date;
  dateUpdated: Date;
}
```

### 1.4 Create Conversation
**POST** `/conversations`

**Request Body:**
```typescript
{
  friendlyName: string; // Contact name
  participants?: Array<{
    userId?: string;
    phoneNumber?: string; // E.164 format: +1234567890
    email?: string;
  }>;
  attributes?: {
    channel: 'SMS' | 'WhatsApp' | 'Email';
    contactDetails?: {
      email?: string;
      phone?: string;
      ownerId?: string;
      tags?: string[];
      dnd?: boolean;
    };
  };
}
```

**Response:**
```typescript
Conversation
```

**Backend Implementation:**
1. Create Twilio Conversation
2. Store custom attributes in Twilio `attributes` field
3. Add participants if provided
4. Return conversation object

### 1.5 Send Message
**POST** `/conversations/:sid/messages`

**Request Body:**
```typescript
{
  body: string; // Message text
  author?: string; // Optional: user identifier
  attributes?: {
    channel: 'SMS' | 'WhatsApp' | 'Email';
    // For email
    subject?: string;
    fromEmail?: string;
    fromName?: string;
    cc?: string[];
    bcc?: string[];
  };
}
```

**Response:**
```typescript
Message
```

**Backend Implementation:**
- Get conversation `attributes` to determine channel
- If SMS: Use Twilio SMS API → Create Twilio message
- If WhatsApp: Use Twilio WhatsApp API → Create Twilio message
- If Email: Use Twilio SendGrid → Create message record in Twilio conversation
- Store channel info in message `attributes`
- Emit WebSocket event `message:sent` after sending

### 1.6 Send Email (Alternative to generic message)
**POST** `/conversations/:sid/emails`

**Request Body:**
```typescript
{
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string; // Default: system email
  fromName?: string;
  cc?: string[];
  bcc?: string[];
}
```

**Response:**
```typescript
Message // Created message record
```

**Backend Implementation:**
- Send email via Twilio SendGrid
- Create message record in Twilio conversation
- Store email metadata in message `attributes`

### 1.7 Add Participant
**POST** `/conversations/:sid/participants`

**Request Body:**
```typescript
{
  userId?: string;
  phoneNumber?: string; // E.164 format
  email?: string;
}
```

**Response:**
```typescript
Participant
```

### 1.8 Remove Participant
**DELETE** `/conversations/:sid/participants/:participantSid`

**Response:**
```typescript
{ message: 'Participant removed' }
```

---

## 2. WebSocket Events (Socket.io)

### 2.1 Connection Setup

**Server-side:**
```typescript
// Authenticate on connection
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!verifyJWT(token)) {
    return next(new Error('Authentication error'));
  }
  socket.userId = decodeJWT(token).userId;
  next();
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);
});
```

### 2.2 Client → Server Events (Handle These)

**Subscribe to Conversation:**
```typescript
socket.on('subscribe:conversation', async ({ conversationSid }) => {
  socket.join(`conversation:${conversationSid}`);
});

socket.on('unsubscribe:conversation', ({ conversationSid }) => {
  socket.leave(`conversation:${conversationSid}`);
});
```

**Typing Indicators:**
```typescript
socket.on('typing:start', ({ conversationSid }) => {
  socket.to(`conversation:${conversationSid}`).emit('typing:start', {
    conversationSid,
    userId: socket.userId,
  });
});

socket.on('typing:stop', ({ conversationSid }) => {
  socket.to(`conversation:${conversationSid}`).emit('typing:stop', {
    conversationSid,
    userId: socket.userId,
  });
});
```

### 2.3 Server → Client Events (Emit These)

**New Message Received:**
```typescript
// After receiving webhook from Twilio or creating message
io.to(`conversation:${conversationSid}`).emit('message:received', {
  conversationSid,
  message: messageObject,
});
```

**Message Sent:**
```typescript
// After sending message successfully
io.to(`conversation:${conversationSid}`).emit('message:sent', {
  conversationSid,
  message: messageObject,
});
```

**Conversation Updated:**
```typescript
// When conversation attributes change (starred, unread, etc.)
io.to(`conversation:${conversationSid}`).emit('conversation:updated', {
  conversationSid,
  conversation: conversationObject,
});
```

**Delivery Receipt:**
```typescript
// After receiving Twilio status webhook
io.to(`conversation:${conversationSid}`).emit('delivery:receipt', {
  conversationSid,
  receipt: {
    messageSid,
    status: 'delivered' | 'read' | 'failed',
  },
});
```

---

## 3. Twilio Webhooks (Required)

### 3.1 SMS Status Webhook
**POST** `/webhooks/twilio/sms/status`

**From Twilio:**
- `MessageSid`
- `MessageStatus` (queued, sent, delivered, read, failed)
- `To` / `From`

**Action:**
1. Find message by Twilio SID
2. Update message `attributes.status`
3. Emit `delivery:receipt` WebSocket event

### 3.2 WhatsApp Status Webhook
**POST** `/webhooks/twilio/whatsapp/status`

**Same as SMS webhook**

### 3.3 Email Status Webhook (SendGrid)
**POST** `/webhooks/twilio/email/status`

**From SendGrid:**
- Event type (delivered, opened, clicked, bounced)
- Email message ID

**Action:**
1. Find message by email ID
2. Update message status
3. Emit `delivery:receipt` WebSocket event

### 3.4 Twilio Conversation Webhook (Optional)
**POST** `/webhooks/twilio/conversation`

**When new message arrives in Twilio Conversation:**
1. Fetch message from Twilio
2. Store in database
3. Emit `message:received` WebSocket event

---

## 4. Helper Endpoint (Optional)

### 4.1 Update Conversation Attributes
**PATCH** `/conversations/:sid/attributes`

**Request Body:**
```typescript
{
  isStarred?: boolean;
  unreadCount?: number;
  contactDetails?: {
    ownerId?: string;
    tags?: string[];
    dnd?: boolean;
  };
}
```

**Response:**
```typescript
Conversation
```

**Implementation:**
- Update Twilio conversation `attributes` JSON field
- Merge with existing attributes

---

## 5. Minimal Database Schema

### Conversations Table (or use Twilio Conversations API directly)
```sql
- sid (VARCHAR, PK) - Twilio Conversation SID
- attributes (TEXT) - JSON string with custom fields
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### Messages Table (or use Twilio Messages API)
```sql
- sid (VARCHAR, PK) - Twilio Message SID
- conversationSid (VARCHAR, FK)
- index (INT) - Twilio message index
- author (VARCHAR)
- body (TEXT)
- attributes (TEXT) - JSON string
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

**Note:** You can use Twilio's API directly without storing locally, but storing locally enables faster queries and offline access.

---

## 6. Implementation Priority

### Phase 1 (Critical - Launch MVP)
1. ✅ **GET** `/conversations` - List conversations
2. ✅ **GET** `/conversations/:sid/messages` - Get messages
3. ✅ **POST** `/conversations/:sid/messages` - Send SMS/WhatsApp
4. ✅ **POST** `/conversations/:sid/emails` - Send Email
5. ✅ **WebSocket** - Basic connection + `message:received` event
6. ✅ **Webhook** - SMS/WhatsApp status webhooks

### Phase 2 (Important - Better UX)
7. **WebSocket** - `message:sent`, `typing:start/stop` events
8. **PATCH** `/conversations/:sid/attributes` - Update starred/unread
9. **Webhook** - Email status webhook

### Phase 3 (Nice to Have)
10. **GET** `/conversations` - Server-side filtering
11. **POST** `/conversations` - Create conversation
12. Advanced participant management

---

## 7. Backend Code Structure (Example)

```typescript
// routes/chat.ts
import express from 'express';
import { Twilio } from 'twilio';

const router = express.Router();
const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Get conversations
router.get('/conversations', async (req, res) => {
  const conversations = await twilioClient.conversations.v1
    .services(process.env.TWILIO_CHAT_SERVICE_SID)
    .conversations.list({ limit: req.query.limit || 50 });
  
  // Transform to match frontend format
  const formatted = conversations.map(conv => ({
    sid: conv.sid,
    friendlyName: conv.friendlyName,
    attributes: conv.attributes, // Already JSON string
    // ... other fields
  }));
  
  res.json(formatted);
});

// Send SMS message
router.post('/conversations/:sid/messages', async (req, res) => {
  const { sid } = req.params;
  const { body, attributes } = req.body;
  
  // Get conversation to check channel
  const conversation = await twilioClient.conversations.v1
    .conversations(sid)
    .fetch();
  
  const convAttrs = JSON.parse(conversation.attributes || '{}');
  const channel = attributes?.channel || convAttrs.channel || 'SMS';
  
  if (channel === 'SMS') {
    // Send SMS via Twilio
    const message = await twilioClient.messages.create({
      body: req.body.body,
      to: req.body.to, // Get from conversation participants
      from: process.env.TWILIO_PHONE_NUMBER,
    });
    
    // Create message in Twilio conversation
    const convMessage = await twilioClient.conversations.v1
      .conversations(sid)
      .messages.create({
        body: req.body.body,
        author: req.user.id,
        attributes: JSON.stringify({
          channel: 'SMS',
          twilioMessageId: message.sid,
          status: 'sent',
        }),
      });
    
    // Emit WebSocket event
    io.to(`conversation:${sid}`).emit('message:sent', {
      conversationSid: sid,
      message: convMessage,
    });
    
    res.json(convMessage);
  }
  // Similar for WhatsApp and Email...
});

// Twilio webhook
router.post('/webhooks/twilio/sms/status', async (req, res) => {
  const { MessageSid, MessageStatus } = req.body;
  
  // Find message and update status
  // Emit delivery:receipt WebSocket event
  
  res.status(200).send('OK');
});
```

---

## 8. Environment Variables Needed

```env
TWILIO_ACCOUNT_SID=ACxxx...
TWILIO_AUTH_TOKEN=xxx
TWILIO_CHAT_SERVICE_SID=ISxxx...
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
JWT_SECRET=xxx
```

---

## 9. Summary - Minimal APIs

**REST Endpoints (8 total):**
1. GET `/conversations` - List
2. GET `/conversations/:sid` - Get one
3. GET `/conversations/:sid/messages` - Get messages
4. POST `/conversations` - Create (optional)
5. POST `/conversations/:sid/messages` - Send message
6. POST `/conversations/:sid/emails` - Send email
7. POST `/conversations/:sid/participants` - Add participant
8. DELETE `/conversations/:sid/participants/:participantSid` - Remove

**WebSocket Events (5 handle, 4 emit):**
- Handle: `subscribe:conversation`, `unsubscribe:conversation`, `typing:start`, `typing:stop`
- Emit: `message:received`, `message:sent`, `conversation:updated`, `delivery:receipt`

**Webhooks (3 total):**
1. POST `/webhooks/twilio/sms/status`
2. POST `/webhooks/twilio/whatsapp/status`
3. POST `/webhooks/twilio/email/status`

**Total: 8 REST + 1 WebSocket + 3 Webhooks = 12 endpoints minimum**

This is the absolute minimum needed to support the frontend chat system with Twilio integration.

