# Chat System Backend API Specification

This document outlines all the backend APIs needed to support the chat system UI. The frontend uses Twilio for SMS, WhatsApp, and Email messaging.

## Base URL
All endpoints should be prefixed with `/api/v1`

## Authentication
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

---

## 1. Conversations APIs

### 1.1 Get Conversations List
**GET** `/conversations`

**Query Parameters:**
```typescript
{
  filter?: 'unread' | 'recents' | 'starred' | 'all'; // Default: 'all'
  search?: string; // Search by contact name, email, phone
  sort?: 'latest' | 'oldest'; // Default: 'latest'
  page?: number; // Default: 1
  pageSize?: number; // Default: 50
  channel?: 'SMS' | 'WhatsApp' | 'Email'; // Filter by channel
}
```

**Response:**
```typescript
BaseApiResponse<{
  data: ConversationOutput[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}>
```

**ConversationOutput:**
```typescript
{
  id: string; // UUID or string ID
  contactId: string; // Reference to contact
  fullName: string;
  username?: string;
  profile?: string; // Avatar URL
  title?: string; // Job title/role
  channel: 'SMS' | 'WhatsApp' | 'Email';
  unreadCount: number;
  isStarred: boolean;
  lastMessage?: {
    id: string;
    message: string;
    sender: string; // 'You' or contact name
    timestamp: string; // ISO 8601
    channel: 'SMS' | 'WhatsApp' | 'Email';
  };
  lastMessageTimestamp?: string; // ISO 8601
  contactDetails: ContactDetailOutput;
}
```

### 1.2 Get Single Conversation
**GET** `/conversations/:conversationId`

**Response:**
```typescript
BaseApiResponse<ConversationOutput>
```

### 1.3 Update Conversation
**PATCH** `/conversations/:conversationId`

**Request Body:**
```typescript
{
  isStarred?: boolean;
  unreadCount?: number; // Set to 0 to mark as read
}
```

**Response:**
```typescript
BaseApiResponse<ConversationOutput>
```

### 1.4 Delete Conversation
**DELETE** `/conversations/:conversationId`

**Response:**
```typescript
BaseApiResponse<{ message: string }>
```

---

## 2. Messages APIs

### 2.1 Get Messages for Conversation
**GET** `/conversations/:conversationId/messages`

**Query Parameters:**
```typescript
{
  page?: number; // Default: 1
  pageSize?: number; // Default: 50
  before?: string; // ISO 8601 timestamp - get messages before this date
  after?: string; // ISO 8601 timestamp - get messages after this date
}
```

**Response:**
```typescript
BaseApiResponse<{
  data: MessageOutput[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
}>
```

**MessageOutput:**
```typescript
{
  id: string;
  conversationId: string;
  sender: string; // User ID or 'system' or contact name
  senderType: 'user' | 'contact' | 'system';
  message: string;
  channel: 'SMS' | 'WhatsApp' | 'Email';
  timestamp: string; // ISO 8601
  status?: 'sent' | 'delivered' | 'read' | 'failed'; // For SMS/WhatsApp
  metadata?: {
    twilioMessageId?: string; // Twilio SID
    twilioStatus?: string;
    emailMessageId?: string; // Email message ID
    attachments?: Array<{
      url: string;
      filename: string;
      contentType: string;
      size: number;
    }>;
  };
}
```

### 2.2 Send SMS Message
**POST** `/conversations/:conversationId/messages/sms`

**Request Body:**
```typescript
{
  message: string;
  from?: string; // Twilio phone number (defaults to system default)
  to: string; // Contact's phone number
  // Optional: schedule for later
  scheduledAt?: string; // ISO 8601
}
```

**Response:**
```typescript
BaseApiResponse<MessageOutput>
```

**Backend Implementation Notes:**
- Use Twilio SMS API
- Store Twilio SID in message metadata
- Handle delivery status webhooks from Twilio
- Update message status based on Twilio webhook callbacks

### 2.3 Send WhatsApp Message
**POST** `/conversations/:conversationId/messages/whatsapp`

**Request Body:**
```typescript
{
  message: string;
  from?: string; // Twilio WhatsApp number (defaults to system default)
  to: string; // Contact's WhatsApp number (format: whatsapp:+1234567890)
  // Optional: schedule for later
  scheduledAt?: string; // ISO 8601
}
```

**Response:**
```typescript
BaseApiResponse<MessageOutput>
```

**Backend Implementation Notes:**
- Use Twilio WhatsApp API
- Ensure WhatsApp Business Account is configured
- Handle WhatsApp delivery status webhooks

### 2.4 Send Email Message
**POST** `/conversations/:conversationId/messages/email`

**Request Body:**
```typescript
{
  fromName: string;
  fromEmail: string; // Must be verified Twilio SendGrid sender
  to: string; // Email address
  cc?: string; // Comma-separated or array
  bcc?: string; // Comma-separated or array
  subject: string;
  body: string; // HTML or plain text
  attachments?: Array<{
    filename: string;
    content: string; // Base64 encoded
    contentType: string;
  }>;
  // Optional: schedule for later
  scheduledAt?: string; // ISO 8601
}
```

**Response:**
```typescript
BaseApiResponse<MessageOutput>
```

**Backend Implementation Notes:**
- Use Twilio SendGrid API for email
- Store email message ID in metadata
- Handle email delivery status webhooks
- Support HTML email body

### 2.5 Send Message (Generic)
**POST** `/conversations/:conversationId/messages`

**Request Body:**
```typescript
{
  channel: 'SMS' | 'WhatsApp' | 'Email';
  message: string; // Required for SMS/WhatsApp
  // Email-specific fields
  fromName?: string;
  fromEmail?: string;
  subject?: string;
  body?: string; // For email
  cc?: string;
  bcc?: string;
  // Schedule
  scheduledAt?: string;
}
```

**Response:**
```typescript
BaseApiResponse<MessageOutput>
```

---

## 3. Contacts APIs

### 3.1 Get Contact Details
**GET** `/conversations/:conversationId/contact`

**Response:**
```typescript
BaseApiResponse<ContactDetailOutput>
```

### 3.2 Update Contact Details
**PATCH** `/conversations/:conversationId/contact`

**Request Body:**
```typescript
{
  email?: string;
  phone?: string;
  ownerId?: string; // User ID to assign as owner
  followers?: string[]; // Array of user IDs
  tags?: string[]; // Array of tag strings
  dnd?: boolean; // Do Not Disturb
  dndAll?: boolean;
}
```

**Response:**
```typescript
BaseApiResponse<ContactDetailOutput>
```

### 3.3 Add Contact Email
**POST** `/conversations/:conversationId/contact/emails`

**Request Body:**
```typescript
{
  email: string;
  isPrimary?: boolean;
}
```

### 3.4 Add Contact Phone
**POST** `/conversations/:conversationId/contact/phones`

**Request Body:**
```typescript
{
  phone: string;
  isPrimary?: boolean;
}
```

### 3.5 Add Tag to Contact
**POST** `/conversations/:conversationId/contact/tags`

**Request Body:**
```typescript
{
  tag: string;
}
```

### 3.6 Remove Tag from Contact
**DELETE** `/conversations/:conversationId/contact/tags/:tag`

### 3.7 Add Follower
**POST** `/conversations/:conversationId/contact/followers`

**Request Body:**
```typescript
{
  userId: string;
}
```

### 3.8 Remove Follower
**DELETE** `/conversations/:conversationId/contact/followers/:userId`

**ContactDetailOutput:**
```typescript
{
  email?: string;
  emails?: Array<{
    id: string;
    email: string;
    isPrimary: boolean;
  }>;
  phone?: string;
  phones?: Array<{
    id: string;
    phone: string;
    isPrimary: boolean;
  }>;
  owner?: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  followers?: Array<{
    id: string;
    name: string;
    username: string;
    avatar?: string;
  }>;
  tags?: string[];
  automations?: Array<{
    id: string;
    name: string;
    status: 'active' | 'paused';
  }>;
  dnd: boolean;
  dndAll: boolean;
}
```

---

## 4. Search APIs

### 4.1 Search Conversations
**GET** `/conversations/search`

**Query Parameters:**
```typescript
{
  q: string; // Search query
  filter?: 'unread' | 'recents' | 'starred' | 'all';
  channel?: 'SMS' | 'WhatsApp' | 'Email';
}
```

**Response:**
```typescript
BaseApiResponse<ConversationOutput[]>
```

### 4.2 Search Followers/Users
**GET** `/users/search`

**Query Parameters:**
```typescript
{
  q: string; // Search query
  role?: 'USER' | 'ADMIN' | 'CUST';
}
```

**Response:**
```typescript
BaseApiResponse<Array<{
  id: string;
  name: string;
  username: string;
  avatar?: string;
  email?: string;
}>>
```

---

## 5. Real-time Updates (WebSocket or Polling)

### Option A: WebSocket (Recommended)
**WebSocket** `ws://your-api/ws/conversations`

**Connection:**
- Authenticate with JWT token in query parameter or header
- Subscribe to conversation updates

**Messages:**
```typescript
// Incoming messages
{
  type: 'new_message' | 'message_status' | 'conversation_update';
  data: MessageOutput | ConversationOutput;
}

// Outgoing messages (for subscription)
{
  action: 'subscribe';
  conversationId?: string; // Optional: subscribe to specific conversation
}
```

### Option B: Polling Endpoint
**GET** `/conversations/updates`

**Query Parameters:**
```typescript
{
  lastUpdate?: string; // ISO 8601 timestamp
  conversationIds?: string[]; // Array of conversation IDs to check
}
```

**Response:**
```typescript
BaseApiResponse<{
  newMessages: MessageOutput[];
  updatedConversations: ConversationOutput[];
  timestamp: string; // Current server timestamp
}>
```

---

## 6. Twilio Webhooks

### 6.1 SMS Status Webhook
**POST** `/webhooks/twilio/sms/status`

**Expected from Twilio:**
- MessageSid
- MessageStatus (queued, sent, delivered, read, failed, etc.)
- To/From phone numbers

**Action:**
- Update message status in database
- Update conversation unread count if needed

### 6.2 WhatsApp Status Webhook
**POST** `/webhooks/twilio/whatsapp/status`

**Similar to SMS webhook**

### 6.3 Email Status Webhook (SendGrid)
**POST** `/webhooks/twilio/email/status`

**Expected from SendGrid:**
- Email message ID
- Event type (delivered, opened, clicked, bounced, etc.)

---

## 7. Users/Team APIs (for Owner and Followers)

### 7.1 Get Users List
**GET** `/users`

**Query Parameters:**
```typescript
{
  role?: 'USER' | 'ADMIN' | 'CUST';
  search?: string;
  exclude?: string[]; // User IDs to exclude
}
```

**Response:**
```typescript
BaseApiResponse<Array<{
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  roles: string[];
}>>
```

---

## 8. Manual Actions

### 8.1 Get Manual Actions
**GET** `/conversations/manual-actions`

**Query Parameters:**
```typescript
{
  status?: 'pending' | 'completed' | 'failed';
  page?: number;
  pageSize?: number;
}
```

**Response:**
```typescript
BaseApiResponse<Array<{
  id: string;
  conversationId: string;
  action: string; // Description of manual action
  status: 'pending' | 'completed' | 'failed';
  assignedTo?: string; // User ID
  createdAt: string;
  completedAt?: string;
}>>
```

---

## 9. Schedule Send

### 9.1 Schedule Message
**POST** `/conversations/:conversationId/messages/schedule`

**Request Body:**
```typescript
{
  channel: 'SMS' | 'WhatsApp' | 'Email';
  scheduledAt: string; // ISO 8601 timestamp
  // ... rest of message fields based on channel
}
```

**Response:**
```typescript
BaseApiResponse<{
  id: string;
  scheduledAt: string;
  status: 'scheduled' | 'sent' | 'cancelled';
}>
```

### 9.2 Cancel Scheduled Message
**DELETE** `/scheduled-messages/:messageId`

---

## Database Schema Suggestions

### Conversations Table
```sql
- id (UUID, PK)
- contactId (UUID, FK)
- channel (ENUM: SMS, WhatsApp, Email)
- unreadCount (INT, default 0)
- isStarred (BOOLEAN, default false)
- lastMessageId (UUID, FK)
- lastMessageTimestamp (TIMESTAMP)
- ownerId (UUID, FK to users)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### Messages Table
```sql
- id (UUID, PK)
- conversationId (UUID, FK)
- senderId (UUID, nullable - null if from contact)
- senderType (ENUM: user, contact, system)
- message (TEXT)
- channel (ENUM: SMS, WhatsApp, Email)
- timestamp (TIMESTAMP)
- status (ENUM: sent, delivered, read, failed)
- twilioMessageId (VARCHAR, nullable)
- twilioStatus (VARCHAR, nullable)
- emailMessageId (VARCHAR, nullable)
- scheduledAt (TIMESTAMP, nullable)
- sentAt (TIMESTAMP, nullable)
- createdAt (TIMESTAMP)
```

### Contacts Table
```sql
- id (UUID, PK)
- fullName (VARCHAR)
- username (VARCHAR, nullable)
- profile (VARCHAR, nullable - avatar URL)
- title (VARCHAR, nullable)
- primaryEmail (VARCHAR)
- primaryPhone (VARCHAR)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### ContactEmails Table
```sql
- id (UUID, PK)
- contactId (UUID, FK)
- email (VARCHAR)
- isPrimary (BOOLEAN)
```

### ContactPhones Table
```sql
- id (UUID, PK)
- contactId (UUID, FK)
- phone (VARCHAR)
- isPrimary (BOOLEAN)
```

### ConversationFollowers Table
```sql
- id (UUID, PK)
- conversationId (UUID, FK)
- userId (UUID, FK)
- createdAt (TIMESTAMP)
```

### ConversationTags Table
```sql
- id (UUID, PK)
- conversationId (UUID, FK)
- tag (VARCHAR)
- createdAt (TIMESTAMP)
```

---

## Implementation Priority

### Phase 1 (Critical)
1. ✅ Get Conversations List
2. ✅ Get Messages for Conversation
3. ✅ Send SMS Message
4. ✅ Send WhatsApp Message
5. ✅ Send Email Message
6. ✅ Get Contact Details
7. ✅ Update Conversation (star/unread)

### Phase 2 (Important)
8. Twilio Webhooks (SMS, WhatsApp, Email status)
9. Real-time Updates (WebSocket or Polling)
10. Search Conversations
11. Update Contact Details

### Phase 3 (Nice to Have)
12. Schedule Send
13. Manual Actions
14. Contact Tags Management
15. Followers Management

---

## Notes for Backend Implementation

1. **Twilio Configuration:**
   - Store Twilio credentials securely
   - Configure webhook URLs in Twilio dashboard
   - Handle rate limiting and errors gracefully

2. **Email via SendGrid:**
   - Verify sender emails in SendGrid
   - Handle email bounces and failures
   - Support HTML email body

3. **Real-time Updates:**
   - WebSocket is preferred for better UX
   - Polling is acceptable as fallback
   - Consider using Redis pub/sub for scaling

4. **Performance:**
   - Index database on frequently queried fields (conversationId, timestamp, channel)
   - Paginate large message lists
   - Cache conversation lists with TTL

5. **Security:**
   - Validate all inputs
   - Rate limit message sending
   - Verify user permissions for contacts/conversations
   - Sanitize message content

