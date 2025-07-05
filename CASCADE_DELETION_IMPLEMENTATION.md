# Cascade Deletion Implementation

## Overview

This implementation adds cascade deletion functionality to the CodeFolio application, ensuring that when a user or post is deleted, all related content is automatically cleaned up to prevent orphaned data and "Unknown User" issues.

## Features Implemented

### 1. User Cascade Deletion

When a user is deleted (`User.findByIdAndDelete()`), the following actions are automatically performed:

- **Posts**: All posts authored by the user are deleted
- **Comments & Replies**: All comments and replies made by the user are removed from all posts
- **Notifications**: All notifications where the user is either sender or recipient are deleted
- **Social Connections**: User is removed from other users' following/followers lists
- **Voting History**: User's votes are removed from other users' votedPosts arrays

### 2. Post Cascade Deletion

When a post is deleted (`Post.findByIdAndDelete()`), the following actions are automatically performed:

- **Notifications**: All notifications related to the post are deleted
- **Voting Records**: The post is removed from all users' votedPosts arrays

### 3. Comment & Reply Deletion Routes

Added new API endpoints for deleting individual comments and replies:

- `DELETE /api/posts/:id/comments/:commentId` - Delete a comment and its notifications
- `DELETE /api/posts/:id/comments/:commentId/replies/:replyId` - Delete a reply

## Technical Implementation

### Model Changes

#### User.js

```javascript
// Pre-deletion hook
userSchema.pre("findOneAndDelete", async function (next) {
	// Cascade deletion logic for users
})
```

#### Post.js

```javascript
// Pre-deletion hook
postSchema.pre("findOneAndDelete", async function (next) {
	// Cascade deletion logic for posts
})

// Helper method for comment cleanup
postSchema.methods.cleanupCommentNotifications = async function (commentId) {
	// Clean up notifications related to specific comments
}
```

### Route Changes

#### postRoutes.js

- Added comment deletion route with authorization checks
- Added reply deletion route with authorization checks
- Both routes properly clean up related notifications and re-populate user data

## Security & Authorization

All deletion operations include proper authorization checks:

- Users can only delete their own content
- Admins can delete any content
- Authorization is handled via the `isAuthorizedUser` utility function

## Error Handling

The implementation includes comprehensive error handling:

- MongoDB operation failures are caught and logged
- Failed cascade operations don't prevent the main deletion
- Detailed error messages for debugging

## Testing

Comprehensive tests have been created to verify:

- User cascade deletion removes all related content
- Post cascade deletion cleans up notifications and voting records
- Database integrity is maintained after deletions

## Benefits

1. **Data Integrity**: Prevents orphaned data in the database
2. **User Experience**: Eliminates "Unknown User" displays in comments
3. **Performance**: Reduces database bloat from unused references
4. **Consistency**: Ensures clean data relationships across the application

## Usage

The cascade deletion works automatically - no changes needed to existing deletion calls:

```javascript
// This will now automatically cascade
await User.findByIdAndDelete(userId)
await Post.findByIdAndDelete(postId)
```

## Database Operations Summary

### User Deletion Cascades:

1. `Post.deleteMany({ author: userId })`
2. `Post.updateMany({}, { $pull: { "comments.$[].replies": { user: userId } } })`
3. `Post.updateMany({}, { $pull: { comments: { user: userId } } })`
4. `Notification.deleteMany({ $or: [{ sender: userId }, { recipient: userId }] })`
5. `User.updateMany({ following: userId }, { $pull: { following: userId } })`
6. `User.updateMany({ followers: userId }, { $pull: { followers: userId } })`
7. `User.updateMany({}, { $pull: { votedPosts: { postId: { $in: userPosts } } } })`

### Post Deletion Cascades:

1. `Notification.deleteMany({ relatedPost: postId })`
2. `User.updateMany({ 'votedPosts.postId': postId }, { $pull: { votedPosts: { postId: postId } } })`

This implementation ensures complete data consistency and resolves the "Unknown User" issue by maintaining proper relationships between all entities in the system.
