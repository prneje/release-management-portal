# Release Management Portal - Backend

This is the Spring Boot backend for the Release Management Portal. It provides a REST API to manage release data.

## Project Structure

This project is a monorepo containing:
- **`backend/`**: A Java Spring Boot application that serves the REST API.
- **`src/`**: An Angular single-page application for the user interface.

For the application to work correctly, both the backend and frontend must be running.

## Running the Application

### 1. Running the Backend (API Server)

The backend is a standard Spring Boot application.

**Prerequisites:**
- Java 17 or later
- Apache Maven 3.6 or later

**Steps:**
1.  Navigate to the `backend` directory in your terminal:
    ```bash
    cd backend
    ```

2.  Run the application using the Maven Spring Boot plugin:
    ```bash
    mvn spring-boot:run
    ```

The backend API server will start on `http://localhost:8080`.

### 2. Running the Frontend (UI)

The frontend is a zoneless Angular application. It is designed to be served by the development environment it's running in (like AI Studio). The environment handles compiling and serving the application.

The frontend is configured to send API requests to the backend server, which it expects to be running on `http://localhost:8080`.

### Combined Workflow

1.  **Start the Backend**: Follow the steps above to get the backend server running first.
2.  **Start the Frontend**: The development environment will automatically serve the Angular application.
3.  **Access the Portal**: Open the application URL provided by your development environment. The frontend will load and communicate with the backend API.

## Database

The application uses an in-memory H2 database. The database is initialized with sample data from `src/main/resources/data.sql` every time the application starts.

You can access the H2 database console in your browser at:

[http://localhost:8080/h2-console](http://localhost:8080/h2-console)

**H2 Console Settings:**
- **Driver Class**: `org.h2.Driver`
- **JDBC URL**: `jdbc:h2:mem:releasedb`
- **User Name**: `sa`
- **Password**: (leave empty)

## Key API Endpoints

The backend provides a complete set of RESTful endpoints to support all UI functionalities.

- `GET /api/releases`: Fetches all releases.
- `GET /api/releases/{id}`: Fetches a single release by its ID.
- `POST /api/releases`: Creates a new release.
- `PUT /api/releases/{releaseId}/...`: A collection of endpoints to update release, team, and component statuses.
- `GET /api/health`: A health-check endpoint used by the frontend to verify API status.
