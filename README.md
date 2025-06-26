# TOC Portal - Incident Management System

A modern, feature-rich incident management and ticketing portal built with Node.js, Express, Prisma, and PostgreSQL. Designed for managing technical incidents with comprehensive filtering, bulk operations, and real-time updates.

## 🚀 Features

### Core Functionality
- **Incident Management**: Create, view, update, and resolve incidents
- **Advanced Filtering**: Filter by status, priority, severity, tags, site, customer
- **Full-Text Search**: Search across titles, descriptions, root causes, and timeline
- **Bulk Operations**: Assign, tag, and close multiple incidents simultaneously
- **Timeline Tracking**: Complete audit trail of all incident changes and comments
- **Role-Based Access**: Viewer, Editor, and Admin permissions

### Modern UI
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-Time Updates**: Live incident status and timeline updates
- **Advanced Filtering**: Collapsible sidebar with multiple filter options
- **Sortable Tables**: Sort by any column with visual indicators
- **Modal Dialogs**: Clean, modern create/edit forms
- **Bulk Selection**: Checkbox-based multi-select with action toolbar

### Integration & Monitoring
- **Webhook Support**: External incident ingestion via REST API
- **Health Monitoring**: `/healthz` endpoint for service monitoring
- **Prometheus Metrics**: Built-in metrics collection
- **Structured Logging**: JSON-formatted logs for log aggregation

## 🛠️ Technology Stack

- **Backend**: Node.js 20, Express.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based with Supabase integration
- **Frontend**: Modern HTML5 with Tailwind CSS and vanilla JavaScript
- **Monitoring**: Prometheus metrics, structured logging
- **Deployment**: Railway-ready with GitHub Actions CI/CD

## 📋 Prerequisites

- Node.js 20 or higher
- PostgreSQL database
- Supabase account (for authentication)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd mock-toc-portal
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server
PORT=8080
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Authentication
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
SUPABASE_URL=https://your-project.supabase.co
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 📚 API Documentation

### Authentication

All API endpoints (except webhooks) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Incident Endpoints

#### List Incidents
```http
GET /api/incidents?limit=50&offset=0&sortBy=createdAt&sortOrder=desc&status=OPEN&priority=HIGH&search=charger
```

**Query Parameters:**
- `limit` (number): Number of incidents to return (default: 50)
- `offset` (number): Number of incidents to skip (default: 0)
- `sortBy` (string): Field to sort by (default: createdAt)
- `sortOrder` (string): Sort direction - 'asc' or 'desc' (default: desc)
- `status` (string): Filter by status (OPEN, ACKNOWLEDGED, RESOLVED)
- `priority` (string): Filter by priority (CRITICAL, HIGH, MEDIUM, LOW)
- `severityLevel` (string): Filter by severity (SEV0, SEV1, SEV1A, SEV2, SEV3)
- `customerId` (string): Filter by customer ID
- `siteId` (string): Filter by site ID
- `tags` (string): Comma-separated list of tags
- `search` (string): Full-text search query

#### Create Incident
```http
POST /api/incidents
Content-Type: application/json

{
  "title": "Charger Fault Detected",
  "description": "Charger CH-001 is showing offline status",
  "priority": "HIGH",
  "severityLevel": "SEV2",
  "faultReported": "Long Term Unavailable (LTU)",
  "customerId": "uuid",
  "siteId": "uuid",
  "chargerIds": ["uuid1", "uuid2"],
  "tags": ["charger", "offline"],
  "source": "MANUAL"
}
```

#### Get Incident Details
```http
GET /api/incidents/:id
```

#### Update Incident
```http
PATCH /api/incidents/:id
Content-Type: application/json

{
  "status": "ACKNOWLEDGED",
  "assignedToId": "user-uuid",
  "priority": "CRITICAL",
  "rootCause": "Network connectivity issue",
  "actionTaken": "Router reset performed"
}
```

#### Add Comment
```http
POST /api/incidents/:id/comment
Content-Type: application/json

{
  "text": "Engineer dispatched to site"
}
```

#### Bulk Operations
```http
POST /api/incidents/bulk
Content-Type: application/json

{
  "ids": ["uuid1", "uuid2", "uuid3"],
  "action": "assign",
  "assignedToId": "user-uuid"
}
```

**Supported Actions:**
- `assign`: Assign incidents to a user
- `tag`: Add tags to incidents
- `close`: Close incidents (set status to RESOLVED)

### Supporting Data Endpoints

#### Get Customers
```http
GET /api/customers
```

#### Get Sites
```http
GET /api/sites
```

#### Get Sites for Customer
```http
GET /api/customers/:customerId/sites
```

#### Get Chargers
```http
GET /api/chargers
```

#### Get Chargers for Site
```http
GET /api/sites/:siteId/chargers
```

### Webhook Endpoints

#### Create Incident via Webhook
```http
POST /webhooks/incidents
Content-Type: application/json

{
  "externalId": "EXT-001",
  "title": "External Incident",
  "description": "Incident created via webhook",
  "severityLevel": "SEV1",
  "customerId": "uuid",
  "siteId": "uuid",
  "chargerIds": ["uuid1"],
  "tags": ["webhook", "external"]
}
```

### Health & Monitoring

#### Health Check
```http
GET /healthz
```

#### Prometheus Metrics
```http
GET /metrics
```

## 🔐 Role-Based Access Control

The system supports three user roles:

### Viewer
- View incidents and their details
- Search and filter incidents
- View timeline and audit logs

### Editor
- All Viewer permissions
- Create new incidents
- Update incident details
- Add comments to timeline
- Perform bulk operations
- Update root cause and action taken

### Admin
- All Editor permissions
- Configure system settings
- Resolve incidents
- Full system access

## 🎨 Frontend Features

### Incident List View
- Sortable columns (ID, title, status, priority, severity, site, assigned to, last updated)
- Advanced filtering sidebar
- Full-text search
- Bulk selection with action toolbar
- Responsive table design

### Incident Detail View
- Header with editable status, priority, and severity
- Tabbed interface (Timeline, Details, Audit Log)
- Related entities display (customer, site, chargers)
- Editable root cause and action taken fields
- Complete timeline with comments and status changes

### Create/Edit Modal
- Comprehensive form with all incident fields
- Inline validation
- Customer, site, and charger selection
- Tag management

### Navigation & User Features
- Modern navigation bar with saved filters
- User profile menu with role display
- Mobile-responsive design
- Keyboard shortcuts and accessibility features

## 🚀 Deployment

### Railway Deployment

The application is configured for Railway deployment with automatic CI/CD:

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main branch

### Environment Variables

Required environment variables for production:

```env
PORT=8080
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
SUPABASE_URL=https://your-project.supabase.co
```

## 🧪 Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run test:ci

# Database seeding
npm run seed
```

### Database Schema

The application uses Prisma with the following main models:

- **Customer**: Organizations that own sites
- **Site**: Physical locations with chargers
- **Charger**: Individual charging units
- **Incident**: Technical incidents with full lifecycle tracking
- **TimelineEvent**: Audit trail of all incident changes

### Adding New Features

1. **API Endpoints**: Add routes in `/src/api/`
2. **Services**: Add business logic in `/src/services/`
3. **Validation**: Add Zod schemas in `/src/api/validators/`
4. **Database**: Update Prisma schema and run migrations
5. **Frontend**: Update HTML/JavaScript for new UI features

## 📊 Monitoring & Observability

### Health Checks
- `/healthz` endpoint returns 200 when service is healthy
- Database connectivity verification
- External service dependency checks

### Metrics
- Prometheus-compatible metrics endpoint
- Request latency, count, and error rates
- Database connection pool metrics
- Custom business metrics

### Logging
- Structured JSON logging to STDOUT
- Request/response logging with timing
- Error logging with stack traces
- Audit logging for security events

## 🤝 Contributing

1. Follow the coding standards in `AGENTS.md`
2. Write TypeScript with proper typing
3. Use Zod for validation
4. Add tests for new features
5. Update documentation

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:
1. Check the documentation in `implementation.md`
2. Review the API documentation above
3. Check the health endpoint for service status
4. Review logs for error details
