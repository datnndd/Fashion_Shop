# Fashion Shop

This is a Fashion Shop application built with FastAPI (Backend) and React/Vite (Frontend). It can be easily run using Docker.

## 🚀 Getting Started with Docker

Prerequisites:
- Docker and Docker Compose installed.

### Steps to Run

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <repository_url>
    cd Fashion_Shop
    ```

2.  **Environment Setup**:
    Copy the example environment files to create the actual configuration files.
    ```bash
    cp app/.env.example app/.env
    cp frontend/.env.example frontend/.env
    ```
    *Note: Adjust the values in `app/.env` if you have specific configurations (e.g., Stripe keys, Supabase credentials).*

3.  **Run with Docker Compose**:
    ```bash
    docker-compose up --build
    ```
    This command will build the images and start:
    - **Database** (Postgres) on port `5432`
    - **Backend** (FastAPI) on `http://localhost:8000`
    - **Frontend** (React) on `http://localhost:5173`

4.  **Access the Application**:
    Open your browser and navigate to [http://localhost:5173](http://localhost:5173).

## 📸 Screenshots

### Homepage
![Homepage](/homepage_1766596313065.png)

![Homepage Scroll](/homepage_scroll_1766596327433.png)

### Product Detail
![Product Detail](/product_detail_1766596370496.png)

## 🛠 Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, Postgres
- **Frontend**: Javascript, React, Vite, TailwindCSS
- **Containerization**: Docker, Docker Compose

## 📝 API Documentation

Once the backend is running, you can access the interactive API docs at:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)
