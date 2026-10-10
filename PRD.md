# ChargeNear — Product Requirements Document

## 1. Project Overview

**Project Name:** ChargeNear
**Project Type:** MERN Stack Web Application
**Category:** Electric Vehicle Charging Station Finder

ChargeNear is a web application that helps electric vehicle users find charging stations and view relevant information, including station location, charger type, and availability information.

The application must demonstrate full-stack development using MongoDB, Express.js, React.js, and Node.js, following the supplied hackathon problem statement.

## 2. Problem Statement

Build a MERN-based EV charging station finder that finds available charging stations.

The system must manage station records, locations, charger types, and availability using MongoDB. React provides the user interface, while Node.js and Express.js handle backend APIs.

The system must support the required CRUD operations for managing relevant records and present project information and results clearly.

## 3. Objectives

* Demonstrate MERN stack development.
* Store and manage charging station records using MongoDB.
* Implement REST APIs using Node.js and Express.js.
* Develop a responsive user interface using React.js.
* Implement CRUD operations for charging station records.
* Implement authentication and role-based access where required.
* Display charging station information and availability clearly.
* Provide a usable interface based on the approved ChargeNear Figma prototype.

## 4. Target Users

**EV Owners:** Users who want to discover charging stations and check their recorded information.

**Administrators:** Authorised users responsible for adding, viewing, updating, and deleting charging station records.

## 5. Functional Requirements

### 5.1 Charging Station Discovery

Users must be able to view a list of charging stations.

Each station should display available information such as:

* Station name
* Address and location
* Supported connector types
* Charging speed, when known
* Recorded availability status, when available
* Other relevant station information

Missing information must be handled gracefully rather than invented.

### 5.2 Search and Filtering

Users should be able to search for charging stations using available station or location information.

Where supported by the implemented dataset, users should be able to filter stations by relevant criteria such as connector type and recorded availability.

Search results must be clearly presented.

### 5.3 Station Details

Users must be able to select a station and view its detailed information.

The details page should present the station's location, supported connectors, charging speed, and availability information when these fields exist.

### 5.4 Charging Station Management

The application must support CRUD operations.

* **Create:** Add a charging station record.
* **Read:** View all stations or retrieve a specific station.
* **Update:** Edit an existing station record.
* **Delete:** Remove a station record.

Station management operations must validate input and return appropriate success or error responses.

### 5.5 Availability Management

The system must store and manage availability information associated with charging stations or chargers, according to the implemented data model.

The application must distinguish recorded database status from verified real-time availability.

Live availability must not be claimed unless supported by a reliable data source.

### 5.6 Authentication and Authorisation

Where implemented, authentication must protect restricted operations.

The application should distinguish ordinary users from administrators when role-based access is required.

Only authorised administrators should be permitted to create, update, or delete station records.

Credentials and secrets must not be exposed in frontend code or committed to GitHub.

### 5.7 Responsive User Interface

The React frontend must adapt to desktop and mobile screen sizes.

The interface should follow the ChargeNear Figma prototype and maintain consistent typography, spacing, colours, navigation, and station-card styling.

## 6. Main Application Screens

The initial UI reference contains eight screens:

1. Welcome
2. Vehicle Selection
3. Location Permission
4. Home / Find Stations
5. Station Details
6. Saved Stations
7. Profile
8. Offline Information

These screens are the design reference, not a requirement to implement unsupported functionality. Any screen whose behaviour depends on additional functionality must be implemented consistently with the actual application capabilities.

## 7. Data Requirements

MongoDB will store charging station records and their relevant fields.

A station record may include:

* Unique identifier
* Station name
* Address
* Geographic coordinates, when available
* Connector types
* Charging speeds, when available
* Recorded availability information, when available
* Operator information, when available
* Source and last-updated information, where applicable

The final schema must reflect the selected data source and the fields actually supported.

## 8. Non-Functional Requirements

* Clear and consistent user interface.
* Responsive design.
* Appropriate server-side validation.
* Secure handling of credentials and configuration.
* Meaningful error messages.
* Reliable API responses.
* Appropriate loading, empty, and error states.
* Maintainable and organised code.
* No fabricated claims about station information or live availability.

## 9. Scope Boundaries

The project must prioritise the requirements in the supplied problem statement.

Additional functionality must not delay the essential MERN implementation, CRUD operations, and demonstration of the working application.

Real-time availability, external maps, advanced routing, and other integrations must only be represented as working features if they have actually been implemented and verified.

## 10. Acceptance Criteria

The project is considered ready for demonstration when:

1. The React frontend runs successfully.
2. The Node.js and Express backend runs successfully.
3. The backend connects to MongoDB.
4. Charging station records can be created, viewed, updated, and deleted through the required APIs.
5. The frontend retrieves and displays station information through the backend.
6. Search and supported filters return appropriate results.
7. Station details display the available information accurately.
8. Input validation and API errors are handled appropriately.
9. Restricted management operations are protected where authentication and authorisation are implemented.
10. The application works at desktop and mobile screen sizes.
11. The application does not misrepresent demonstration data as verified real-world or live availability information.
12. The application can be demonstrated using a documented setup procedure.
