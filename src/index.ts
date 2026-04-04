// Client
export { createClient } from "./client.js";

// Webhook verification
export { verifyWebhook } from "./webhooks.js";

// Error classes
export {
  MessagesError,
  AuthenticationError,
  AuthorizationError,
  InvalidRequestError,
  NotFoundError,
  RateLimitError,
  SignatureVerificationError,
} from "./errors.js";

// Resource types
export type {
  Line,
  Chat,
  Message,
  Attachment,
  File,
  OutboxItem,
  Reaction,
  TypingIndicator,
  ReadReceipt,
  Webhook,
  DeletedResponse,
  WebhookEvent,
} from "./types.js";

// Param types
export type {
  ClientConfig,
  MessagesClient,
  SendMessageParams,
  SendReactionParams,
  TypingParams,
  SendReadReceiptParams,
  UploadFileParams,
  ListChatsParams,
  ListMessagesParams,
  ListReactionsParams,
  ListTypingIndicatorsParams,
  ListReadReceiptsParams,
  ListWebhooksParams,
  CreateWebhookParams,
} from "./types.js";

// Pagination
export type { PaginatedResponse } from "./pagination.js";

// Schemas (for advanced use)
export {
  LineSchema,
  ChatSchema,
  MessageSchema,
  ReactionSchema,
  TypingIndicatorSchema,
  ReadReceiptSchema,
  WebhookSchema,
  OutboxItemSchema,
  AttachmentSchema,
  FileSchema,
  ListResponseSchema,
  ErrorResponseSchema,
  DeletedResponseSchema,
  WebhookEventSchema,
} from "./schemas.js";

// Utility type
export type { CamelCaseKeys } from "./util.js";
