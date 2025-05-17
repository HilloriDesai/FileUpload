# Typeface - File Management Application

A modern web application for managing and sharing files, built with React and Tailwind CSS.

## Features

- Upload and manage files (txt, jpg, png, json)
- View file contents directly in the browser
- Download files
- Responsive design
- Modern UI with Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Development

To start the development server:

```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`.

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The build files will be created in the `build` directory.

## API Integration

The application expects the following API endpoints to be available:

- `GET /api/files` - List all files
- `POST /api/files/upload` - Upload a new file
- `GET /api/files/:fileId` - Get file details
- `GET /api/files/:fileId/content` - Get file content
- `GET /api/files/:fileId/download` - Download file

## Supported File Types

- Text files (.txt)
- Images (.jpg, .png)
- JSON files (.json)

## Technologies Used

- React
- React Router
- Axios
- Tailwind CSS
- Headless UI
- Heroicons
