# Google Forms Clone with QR Surveys and Bulk Email

A full-stack MERN application that replicates Google Forms functionality with advanced features including survey creation, QR code generation, and bulk email distribution.

## 🌟 Features

### Core Features
- **Dynamic Form Builder**: Create and edit forms with multiple question types
- **Question Types Supported**:
  - Short Answer
  - Paragraph
  - Multiple Choice
  - Checkboxes
  - Dropdown
- **Form Viewer**: Respondents can fill forms with real-time validation
- **Response Collection**: Store and manage form responses in MongoDB
- **Response Dashboard**: View analytics and export responses as CSV
- **Smooth Animations**: Beautiful UI with Framer Motion animations
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠 Tech Stack

### Frontend
- **React 19** with Hooks
- **Vite** - Lightning fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Framer Motion** - Smooth animations
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **UUID** - Unique ID generation

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variable management
- **Nodemon** - Development auto-reload

## 📋 Prerequisites

- Node.js v14 or higher
- npm or yarn
- MongoDB (local or cloud instance like MongoDB Atlas)
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "google forms"
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

Edit `.env` and add your MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017/google-forms
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/google-forms
PORT=5000
NODE_ENV=development
```

Start the backend server:
```bash
# Development with auto-reload
npm run dev

# Or production
npm start
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```bash
cp .env.example .env
```

The default API URL is already configured for local development. If your backend is on a different port, update `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📁 Project Structure

```
google forms/
├── backend/
│   ├── controllers/
│   │   ├── formController.js
│   │   └── responseController.js
│   ├── model/
│   │   ├── Form.js
│   │   └── Response.js
│   ├── routes/
│   │   ├── formRoutes.js
│   │   └── responseRoutes.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.jsx
│   │   │   ├── FormCard.jsx
│   │   │   ├── QuestionInput.jsx
│   │   │   └── QuestionPreview.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── FormBuilder.jsx
│   │   │   ├── FormViewer.jsx
│   │   │   └── ResponsesDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── .env.example
│
└── README.md
```

## 🔌 API Endpoints

### Form Endpoints
- `POST /api/forms` - Create a new form
- `GET /api/forms` - Get all forms
- `GET /api/forms/:id` - Get a specific form
- `PUT /api/forms/:id` - Update a form
- `DELETE /api/forms/:id` - Delete a form

### Response Endpoints
- `POST /api/responses` - Submit a form response
- `GET /api/responses/:formId` - Get all responses for a form
- `GET /api/responses/:formId/count` - Get response count

## 🎯 Usage Guide

### Creating a Form
1. Click "Create New Form" button
2. Enter form title and description
3. Click "Add Question" to add questions
4. Select question type and configure options
5. Save the form

### Sharing a Form
1. Go to the form in your forms list
2. Click "View" to get the form URL
3. Share this URL with respondents

### Viewing Responses
1. Go to your forms list
2. Click "Responses" on any form card
3. View individual responses
4. Download responses as CSV

### Question Types

**Short Answer**: Single line text input
**Paragraph**: Multi-line text input
**Multiple Choice**: Select one option
**Checkboxes**: Select multiple options
**Dropdown**: Select one from dropdown list

## 🔒 Security Features

- Environment variables for sensitive data (.env)
- CORS enabled for secure cross-origin requests
- Input validation on both frontend and backend
- Required field validation
- Error handling and user feedback

## 📦 Installation & Dependencies

### Backend Dependencies
```json
{
  "express": "^5.2.1",
  "mongoose": "^9.3.2",
  "cors": "^2.8.6",
  "dotenv": "^17.3.1"
}
```

### Frontend Dependencies
```json
{
  "react": "^19.2.4",
  "react-dom": "^19.2.4",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.2",
  "tailwindcss": "^3.4.1",
  "framer-motion": "^10.16.16",
  "lucide-react": "^0.365.0",
  "uuid": "^9.0.1"
}
```

## 🚀 Deployment

### Backend Deployment (Heroku/Vercel)
1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables in platform settings
4. Deploy

### Frontend Deployment (Vercel/Netlify)
1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Set `VITE_API_URL` to production backend URL
4. Deploy

## 🐛 Troubleshooting

**Backend not connecting to MongoDB**
- Check MongoDB service is running
- Verify connection string in .env
- Check MongoDB Atlas credentials and IP whitelist

**Frontend not connecting to backend**
- Verify backend server is running
- Check VITE_API_URL in .env
- Check CORS settings in server.js

**Dependency issues**
- Delete node_modules and package-lock.json
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

## 📝 Future Enhancements

- [ ] QR code generation for easy form sharing
- [ ] Bulk email sending functionality
- [ ] Form analytics and charts

- [ ] Form branching logic
- [ ] File upload support
- [ ] Form templates library
- [ ] Real-time collaboration

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by [Google Forms](https://forms.google.com/)
- Built with [MERN Stack](https://www.mongodb.com/mern-stack)
- Icons from [Lucide React](https://lucide.dev/)
- Animations powered by [Framer Motion](https://www.framer.com/motion/)
- Styling with [TailwindCSS](https://tailwindcss.com/)

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ by the Forms Team</content>
<parameter name="filePath">c:\Users\Anusha\Desktop\google forms\README.md