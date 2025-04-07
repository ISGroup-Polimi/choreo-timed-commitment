# How to run:

This thesis project implements a system based on **Camunda Platform 8** for orchestration. It includes BPMN processes modeled using **Camunda Modeler**, a **Node.js** backend that handles REST calls from the BPMN processes to the supervisor service, and a **MongoDB** NoSQL database for data persistence.

---

## Tech Stack

- **Camunda Platform 8 (via Docker)**
- **Camunda Modeler**
- **Node.js (Express backend)**
- **MongoDB (NoSQL database)**

---

## Prerequisites

Before setting up the system, make sure you have the following tools installed:

- [Docker](https://docs.docker.com/get-docker/)
- [Camunda Platform 8 container](https://github.com/camunda/camunda-platform)
- [Node.js and npm](https://nodejs.org/)
- [Camunda Modeler](https://camunda.com/download/modeler/)

---

## System Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ISGroup-Polimi/choreo-timed-commitment.git
```

---

### 2. Start Camunda Platform 8 with Docker

Make sure Docker is running, then clone and start the official Camunda Platform 8 Docker environment:

```bash
git clone https://github.com/camunda/camunda-platform.git
cd camunda-platform/docker
docker compose up
```

This command launches the full Camunda 8 stack, including:

- Zeebe (workflow engine)
- Operate (monitoring)
- Tasklist (user interface for human tasks)
- Identity (user authentication)
- Elasticsearch (data indexing)

---

### 3. Configure Camunda Modeler

1. Open **Camunda Modeler**.
2. Go to **Zeebe deployment settings**.
3. Set the **Zeebe Gateway Address** to:
4. Open the A_sidecar.bpmn and the B_sidecar.bpmn located in each folder representing the Connection-Point type.

```
localhost:26500
```

4. Now you can deploy the BPMN sidecar processes directly to the running Camunda instance.

---

### 4. Install Backend Dependencies

Go to the `choreo-timed-commitment/commitment_supervisor/monitoring-restful-api`  folder (where `app.js` is located) and install the required Node.js packages:

```bash
npm install
```

---

### 5. Start the Node.js commitment/supervisor services

In the same directory as `app.js`, start the commitment/supervisor services:

```bash
npm start
```

This starts the Node.js service, which listens for REST calls initiated by the BPMN workflows.

---

### 6. Interact with the System

- You can now deploy and start BPMN processes from the **Camunda Modeler**.
- Processes can communicate with the supervisor service via REST.
- Use **Camunda Tasklist** at [http://localhost:8080](http://localhost:8080) to view and complete user tasks.
- MongoDB is used to store and retrieve data processed by the supervisor process.

---



## Final Notes

- Ensure Docker containers are running before deploying processes or starting supervisor services.
- You can monitor running process instances via **Camunda Operate**.
- Human tasks are managed through **Tasklist**.
- Supervisor and Commitment services must be active for workflows to complete successfully.


