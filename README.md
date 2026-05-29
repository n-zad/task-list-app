# Task List App

Full-stack task list application with CRUD operations, React, Express, SQLite, and tests.

## Overview

## Features

## Tech Stack

## Getting Started

## API Routes

## Running Tests

## Design Notes

- The app uses a React frontend with an Express API to keep the UI and persistence logic separate.
- SQLite was chosen for simple local setup while still providing backend data persistence.
- Task validation is handled on the backend so invalid data cannot be saved even if the frontend is bypassed.
- The frontend keeps API calls in a small service module instead of placing `fetch` calls directly inside components.
- Tests cover the main CRUD paths, validation cases, and user-facing task interactions.

## Assumptions

The exercise describes users managing tasks, but does not specify authentication or separate user accounts. This implementation treats users as visitors of the app interface and uses a single shared task list persisted by the backend.

In a production version, I would add authentication and associate each task with a `user_id` so every account has its own task list.
