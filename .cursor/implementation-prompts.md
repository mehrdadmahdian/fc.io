# Implementation Prompts - FC.io Features

## 🎯 **Master Implementation Prompt Template**

```
CONTEXT: You are implementing a new feature for the FC.io flashcard application. 

CODEBASE ANALYSIS REQUIRED:
1. Read and understand the existing codebase structure
2. Identify current patterns for API handlers, database models, and frontend components
3. Analyze authentication and middleware systems
4. Review existing database schema and relationships
5. Understand current frontend architecture and component patterns

IMPLEMENTATION STEPS:
1. Database layer (models, migrations, repositories)
2. Business logic layer (services)
3. API layer (handlers, routes, validation)
4. Frontend components and integration
5. Testing and validation

REQUIREMENTS: [SPECIFIC_REQUIREMENTS]
ACCEPTANCE CRITERIA: [SPECIFIC_CRITERIA]
TECHNICAL CONSTRAINTS: Follow existing Go patterns, maintain API consistency, ensure proper error handling
```

---

## 🔄 **Feature 1: Card Migration Between Boxes**

### **Implementation Prompt:**

```
FEATURE: Card Migration Between Boxes

CONTEXT: Implement the ability for users to move flashcards from one box to another within their personal collection, maintaining learning progress and ensuring data integrity.

CODEBASE ANALYSIS:
1. Examine existing Card and Box models in /api/internal/database/models/
2. Review current card and box repositories in /api/internal/database/repositories/
3. Analyze existing API handlers in /api/internal/handlers/api_handlers/
4. Study frontend box and card components in /dashboard-ui/src/

IMPLEMENTATION REQUIREMENTS:
1. **Database Layer:**
   - Add migration functionality to card repository
   - Implement batch card movement operations
   - Add validation to prevent duplicate cards in destination box
   - Create audit trail for card movements

2. **API Layer:**
   - Create POST /api/cards/migrate endpoint
   - Add PUT /api/cards/{id}/move-to-box/{boxId} endpoint
   - Implement bulk migration: POST /api/cards/bulk-migrate
   - Add validation for box ownership and card existence

3. **Frontend Layer:**
   - Add "Move to Box" / "copy to other box" button in card edit view in a different bar for actions like this
   - Create box selection modal component
   - Implement drag-and-drop functionality for card migration
   - Add bulk selection and migration interface
   - Show migration progress and confirmation

4. **Business Logic:**
   - Preserve spaced repetition data during migration
   - Handle learning progress transfer
   - Implement undo functionality (store previous box ID)
   - Add duplicate detection and handling

ACCEPTANCE CRITERIA:
- Users can move individual cards between their boxes
- Bulk migration works for multiple selected cards
- Learning progress is preserved based on user selection during migration
- Drag-and-drop interface is intuitive and responsive
- Proper error handling for invalid operations
- Audit trail tracks all card movements

TECHNICAL SPECIFICATIONS:
- Use existing authentication middleware
- Follow current API response patterns
- Implement proper transaction handling for data integrity
- Add appropriate logging for debugging
- Ensure real-time UI updates after migration

START WITH: Database model analysis and repository pattern implementation
```

---

## 🔄 **Feature 2: Review Progress Reset**

### **Implementation Prompt:**

```
FEATURE: Review Progress Reset

CONTEXT: Implement comprehensive progress reset functionality allowing users to reset learning progress at various granularity levels (individual cards, entire boxes, or filtered selections).

CODEBASE ANALYSIS:
1. Examine current progress tracking in Card model and related tables
2. Review spaced repetition algorithm implementation
3. Analyze existing card and box services
4. Study current dashboard and box management UI

IMPLEMENTATION REQUIREMENTS:
1. **Database Layer:**
   - Create progress backup system before resets
   - Implement granular reset operations (card-level, box-level, filtered)
   - Add reset audit trail with timestamps and reasons
   - Create scheduled reset functionality

2. **API Layer:**
   - POST /api/cards/{id}/reset-progress (individual card)
   - POST /api/boxes/{id}/reset-progress (entire box)
   - POST /api/cards/bulk-reset (filtered selection)
   - GET /api/progress/reset-history (audit trail)
   - POST /api/progress/backup (manual backup creation)

3. **Frontend Layer:**
   - Add reset buttons in card detail view
   - Create box-level reset option in box settings
   - Implement bulk reset interface with filters
   - Add confirmation dialogs with progress preview
   - Show reset history and backup options

4. **Business Logic:**
   - Multiple confirmation steps for destructive operations
   - Progress backup before any reset operation
   - Configurable reset levels (partial vs complete)
   - Scheduled reset functionality
   - Restore from backup capability

ACCEPTANCE CRITERIA:
- Individual card progress can be reset with confirmation
- Entire box progress can be reset with multiple confirmations
- Bulk reset works with various filters (date, performance, tags)
- Progress is backed up before any reset operation
- Users can view reset history and restore from backups
- Scheduled resets work automatically

TECHNICAL SPECIFICATIONS:
- Implement proper transaction handling for reset operations
- Add comprehensive logging for all reset activities
- Use existing authentication and authorization patterns
- Ensure backup data is properly compressed and stored
- Add rate limiting for bulk operations

START WITH: Progress data analysis and backup system design
```

---

## 🌐 **Feature 3: Social Community Platform**

### **Implementation Prompt:**

```
FEATURE: Social Community Platform

CONTEXT: Transform the application into a social learning network with public box sharing, user following, box forking, and community features.

CODEBASE ANALYSIS:
1. Review current User model and authentication system
2. Examine Box model for adding visibility and social features
3. Analyze existing API patterns for extending with social features
4. Study frontend architecture for adding social components

IMPLEMENTATION REQUIREMENTS:
1. **Database Layer:**
   - Add visibility field to Box model (private, public, unlisted)
   - Create UserFollowing model for follow relationships
   - Create BoxFork model to track forked boxes
   - Add BoxRating and BoxReview models
   - Create ActivityFeed model for social updates

2. **API Layer:**
   - GET /api/boxes/public (discover public boxes)
   - POST /api/users/{id}/follow (follow/unfollow users)
   - POST /api/boxes/{id}/fork (fork public box)
   - POST /api/boxes/{id}/rate (rate and review boxes)
   - GET /api/feed (personalized activity feed)
   - GET /api/users/search (find users)

3. **Frontend Layer:**
   - Add box visibility settings in box creation/edit
   - Create public box discovery page
   - Implement user profile pages with created boxes
   - Add follow/unfollow buttons and follower lists
   - Create box forking interface with customization options
   - Implement rating and review system

4. **Business Logic:**
   - Box visibility and permission management
   - Fork creation with proper attribution
   - Activity feed generation and personalization
   - Content moderation and reporting system
   - Notification system for social interactions

ACCEPTANCE CRITERIA:
- Users can make boxes public and discoverable
- Following system works with proper notifications
- Box forking creates independent copies with attribution
- Rating and review system provides community feedback
- Activity feed shows relevant social updates
- Search functionality finds users and public content

TECHNICAL SPECIFICATIONS:
- Implement proper privacy controls and permissions
- Add content moderation capabilities
- Use efficient queries for social features (avoid N+1 problems)
- Implement caching for frequently accessed public content
- Add proper indexing for search functionality

START WITH: Database schema design for social relationships and box visibility
```

---

## 🔍 **Feature 4: Advanced Search & Discovery**

### **Implementation Prompt:**

```
FEATURE: Advanced Search & Discovery

CONTEXT: Implement comprehensive search functionality across users, boxes, and cards with intelligent filtering, semantic search, and personalized recommendations.

CODEBASE ANALYSIS:
1. Review existing search implementations (if any)
2. Examine database models for searchable fields
3. Analyze current API patterns for extending with search
4. Study frontend components for search interfaces

IMPLEMENTATION REQUIREMENTS:
1. **Database Layer:**
   - Add search indexes to relevant fields (box titles, descriptions, card content)
   - Create SearchHistory model for tracking user searches
   - Implement full-text search capabilities
   - Add search analytics and metrics tracking

2. **Search Infrastructure:**
   - Integrate Elasticsearch or similar search engine
   - Implement semantic search using embeddings
   - Create search result ranking algorithms
   - Add auto-complete and suggestion functionality

3. **API Layer:**
   - GET /api/search/global (search across all content)
   - GET /api/search/users (user-specific search)
   - GET /api/search/boxes (box search with filters)
   - GET /api/search/cards (card content search)
   - GET /api/search/suggestions (auto-complete)

4. **Frontend Layer:**
   - Create unified search interface
   - Implement advanced filter controls
   - Add search result pages with pagination
   - Create saved search functionality
   - Implement search history and suggestions

5. **Business Logic:**
   - Personalized search result ranking
   - Content categorization and tagging
   - Search result caching and optimization
   - Privacy-aware search (respect box visibility)

ACCEPTANCE CRITERIA:
- Global search finds relevant content across all public data
- Advanced filters work effectively (subject, difficulty, language, etc.)
- Semantic search understands content meaning beyond keywords
- Auto-complete provides helpful suggestions
- Search results are ranked by relevance and personalization
- Saved searches and history improve user experience

TECHNICAL SPECIFICATIONS:
- Implement efficient search indexing and updates
- Add proper caching for search results
- Ensure search respects privacy and permissions
- Add search analytics for optimization
- Implement rate limiting for search queries

START WITH: Search infrastructure setup and basic full-text search implementation
```

---

## 🤖 **Feature 5: AI-Powered Content Generation**

### **Implementation Prompt:**

```
FEATURE: AI-Powered Content Generation

CONTEXT: Implement AI-powered flashcard generation from various content types (documents, videos, audio) with customizable extraction parameters and user-defined prompts.

CODEBASE ANALYSIS:
1. Review existing file upload handling patterns
2. Examine current API structure for adding AI endpoints
3. Analyze authentication and rate limiting systems
4. Study frontend file upload and processing components

IMPLEMENTATION REQUIREMENTS:
1. **File Processing Layer:**
   - Support multiple file types (PDF, DOCX, TXT, video, audio)
   - Implement OCR for image content
   - Add YouTube URL processing for video content
   - Create transcript extraction for audio/video files

2. **AI Integration Layer:**
   - Integrate with multiple LLM providers (OpenAI, Claude, local models)
   - Implement prompt template system
   - Add content preprocessing and chunking
   - Create quality validation for generated cards

3. **API Layer:**
   - POST /api/ai/upload-content (file upload and processing)
   - POST /api/ai/generate-cards (AI card generation)
   - GET /api/ai/generation-status/{jobId} (progress tracking)
   - POST /api/ai/prompts (custom prompt management)
   - GET /api/ai/templates (pre-built prompt templates)

4. **Frontend Layer:**
   - Create file upload interface with progress tracking
   - Implement AI configuration panel (prompts, parameters)
   - Add card generation preview and approval system
   - Create prompt template management interface
   - Show generation progress and status updates

5. **Business Logic:**
   - Queue system for batch processing
   - Cost tracking and rate limiting
   - Generation history and analytics
   - Template sharing and community prompts

ACCEPTANCE CRITERIA:
- Multiple file types are processed correctly
- AI generates high-quality flashcards based on content
- Users can customize generation parameters effectively
- Batch processing handles large documents efficiently
- Generated cards can be previewed and edited before saving
- Cost tracking prevents excessive API usage

TECHNICAL SPECIFICATIONS:
- Implement async processing with job queues
- Add proper error handling for AI API failures
- Use efficient file storage and processing
- Implement comprehensive logging for debugging
- Add monitoring for AI model performance and costs

START WITH: File upload system and basic AI integration setup
```

---

## 🎯 **Feature 6: Smart AI Actions & Quick Prompts**

### **Implementation Prompt:**

```
FEATURE: Smart AI Actions & Quick Prompts

CONTEXT: Implement context-aware AI assistance with predefined actions and custom prompts for common card operations, making AI interactions seamless and intuitive.

CODEBASE ANALYSIS:
1. Review existing card editing interfaces and workflows
2. Examine current API patterns for extending with AI features
3. Analyze card and box models for context detection
4. Study frontend card components for adding AI action buttons

IMPLEMENTATION REQUIREMENTS:
1. **Context Detection System:**
   - Implement language detection for boxes and cards
   - Add content type recognition (vocabulary, concepts, formulas)
   - Create subject matter classification
   - Build user preference learning system

2. **AI Actions Framework:**
   - Create predefined action templates (translate, simplify, add examples)
   - Implement dynamic action suggestions based on context
   - Add batch operation capabilities
   - Create preview and approval system for AI suggestions

3. **API Layer:**
   - POST /api/ai/actions/translate (language translation)
   - POST /api/ai/actions/enhance (content enhancement)
   - POST /api/ai/actions/batch (bulk operations)
   - GET /api/ai/actions/suggestions (context-based suggestions)
   - POST /api/prompts/custom (custom prompt management)

4. **Frontend Layer:**
   - Add AI action buttons to card editing interface
   - Create context-aware action suggestions
   - Implement batch AI operations interface
   - Add custom prompt creation and management
   - Show AI processing status and results preview

5. **Business Logic:**
   - Smart context detection and action recommendation
   - Prompt template system with variable substitution
   - User preference learning and adaptation
   - Cost optimization and caching for common operations

ACCEPTANCE CRITERIA:
- Context-aware actions appear automatically based on content
- Language-specific actions work accurately (e.g., "Translate to German")
- Batch operations process multiple cards efficiently
- Custom prompts can be created, saved, and shared
- AI suggestions can be previewed before applying
- System learns from user preferences over time

TECHNICAL SPECIFICATIONS:
- Implement efficient context analysis without excessive API calls
- Add proper caching for repeated operations
- Use existing authentication and rate limiting
- Ensure real-time UI updates during processing
- Add comprehensive error handling for AI failures

START WITH: Context detection system and basic predefined actions
```

---

## 🎧 **Feature 7: AI-Generated Podcast Creation**

### **Implementation Prompt:**

```
FEATURE: AI-Generated Podcast Creation

CONTEXT: Implement AI-powered podcast generation that transforms flashcard boxes into engaging audio content with multiple formats, high-quality TTS, and advanced audio features.

CODEBASE ANALYSIS:
1. Review existing box and card data structures
2. Examine file handling and storage systems
3. Analyze current API patterns for adding media endpoints
4. Study frontend media components and audio handling

IMPLEMENTATION REQUIREMENTS:
1. **Script Generation System:**
   - Implement multiple podcast format templates (Q&A, conversational, lecture)
   - Create content analysis and structuring algorithms
   - Add script customization and editing capabilities
   - Implement adaptive content based on user progress

2. **Text-to-Speech Integration:**
   - Integrate multiple TTS providers (ElevenLabs, Azure, AWS Polly)
   - Implement voice selection and customization
   - Add audio processing and enhancement
   - Create background music and sound effect mixing

3. **API Layer:**
   - POST /api/podcasts/generate (create podcast from box)
   - GET /api/podcasts/status/{jobId} (generation progress)
   - GET /api/podcasts/{id}/download (audio file access)
   - POST /api/podcasts/script/edit (script modification)
   - GET /api/podcasts/voices (available TTS voices)

4. **Frontend Layer:**
   - Create podcast generation configuration interface
   - Implement script preview and editing system
   - Add audio player with chapter markers
   - Create podcast library and management interface
   - Show generation progress and status updates

5. **Audio Processing Pipeline:**
   - Script generation and optimization for audio
   - TTS conversion with quality enhancement
   - Audio mixing and post-processing
   - Chapter marker and metadata insertion
   - File compression and delivery optimization

ACCEPTANCE CRITERIA:
- Multiple podcast formats generate engaging content
- High-quality TTS produces natural-sounding audio
- Scripts can be previewed and edited before audio generation
- Audio includes chapter markers and navigation features
- Generated podcasts can be downloaded or streamed
- Processing handles large boxes efficiently

TECHNICAL SPECIFICATIONS:
- Implement async processing for audio generation
- Add proper file storage and CDN integration
- Use efficient audio processing libraries
- Implement comprehensive error handling for TTS failures
- Add monitoring for audio generation performance and costs

START WITH: Script generation system and basic TTS integration
```

---

## 🚀 **Master Execution Strategy**

### **Sequential Implementation Order:**

1. **Start with Feature 2 (Progress Reset)** - Simplest, builds confidence
2. **Move to Feature 1 (Card Migration)** - Core functionality, moderate complexity
3. **Implement Feature 6 (AI Actions)** - High impact, manageable scope
4. **Add Feature 3 (Social Platform)** - Complex but well-defined
5. **Build Feature 4 (Search & Discovery)** - Requires infrastructure setup
6. **Develop Feature 5 (AI Content Generation)** - Complex AI integration
7. **Finish with Feature 7 (Podcast Creation)** - Most complex, highest impact

### **Pre-Implementation Checklist for Each Feature:**

```
□ Read and understand existing codebase patterns
□ Identify reusable components and services
□ Plan database schema changes and migrations
□ Design API endpoints following existing conventions
□ Sketch frontend component hierarchy
□ Consider authentication and authorization requirements
□ Plan error handling and validation strategies
□ Identify external service integrations needed
□ Estimate resource requirements and costs
□ Define testing and validation approach
```

### **Post-Implementation Validation:**

```
□ All acceptance criteria met
□ API endpoints properly documented
□ Frontend components responsive and accessible
□ Error handling comprehensive and user-friendly
□ Performance meets acceptable standards
□ Security considerations addressed
□ Integration tests passing
□ User experience smooth and intuitive
□ Code follows existing patterns and conventions
□ Documentation updated
```

---

*Use these prompts systematically to implement each feature with comprehensive planning and execution.*
