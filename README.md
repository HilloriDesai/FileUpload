# Typeface - File Management Application

A modern web application for managing and sharing files, built with React, Django, and Tailwind CSS.

## Features

- Upload and manage files (txt, jpg, png, json)
- View file contents directly in the browser
- Download files
- Responsive design
- Modern UI with Tailwind CSS
- Secure file handling
- RESTful API

## Prerequisites

- Python 3.8 or higher
- Node.js (v14 or higher)
- npm or yarn
- Docker and Docker Compose (optional)

## Project Structure

```
.
├── backend/             # Django backend
│   ├── file_api/       # File management API
│   ├── dropbox_clone/  # Django project settings
│   └── requirements.txt # Python dependencies
├── frontend/           # React frontend
│   ├── src/           # Source code
│   └── package.json   # Node.js dependencies
└── docker-compose.yml # Docker configuration
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Run migrations:

   ```bash
   python manage.py migrate
   ```

6. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

### Docker Setup (Optional)

1. Build and start the containers:

   ```bash
   docker-compose up --build
   ```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## API Documentation

### Endpoints

- `GET /api/files` - List all files
- `POST /api/files/upload` - Upload a new file
- `GET /api/files/:fileId` - Get file details
- `GET /api/files/:fileId/content` - Get file content
- `GET /api/files/:fileId/download` - Download file

## Troubleshooting

### Common Issues

1. **Database Connection Issues**

   - Check database credentials in .env
   - Ensure database service is running

2. **File Upload Issues**

   - Check file size limits
   - Verify file permissions
   - Check storage configuration

3. **API Connection Issues**
   - Verify API URL in frontend .env
   - Check CORS configuration
   - Ensure backend server is running

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
