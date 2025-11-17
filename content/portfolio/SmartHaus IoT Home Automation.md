---
title: "SmartHaus: IoT Home Automation with Real-Time Monitoring"
date: 2025-11-10
tags: ["IoT", "ESP32", "Flutter", "Firebase", "WebSocket", "Arduino", "Smart Home", "Security"]
categories: ["IoT", "Security", "Mobile Development"]
description: "Built a comprehensive IoT home automation system with Flutter mobile app, ESP32-CAM streaming, and biometric security. Features real-time device control, environmental monitoring, and cross-platform integration."
featured_image: "/images/smarthauslogin.jpg"
draft: false
show: default
---

SmartHaus is a full-stack IoT security and automation system I built to control and monitor smart home devices through a mobile app. The project integrates ESP32-based hardware with a Flutter mobile application, featuring real-time video streaming, biometric access control, and environmental sensors.

ESP32/Arduino hardware layer for sensors and actuators, Firebase as the real-time database backend, and a Flutter mobile app for user interaction. The ESP32-CAM handles video streaming over WebSocket while the NodeMCU manages fingerprint authentication and water level monitoring through I2C communication with an Arduino Mega controlling relays and SMS alerts.

{{< video src="/videos/smarthausdemo.mp4" alt="SmartHaus System Demo" >}}

## Hardware Components

I designed the system around dual microcontrollers to separate concerns and maintain reliability. The ESP8266 NodeMCU acts as the master controller, handling WiFi connectivity, Firebase sync, and fingerprint authentication through a GT-521F32 sensor. It communicates with an Arduino Mega slave via I2C, which manages the 8-channel relay board and SIM800L GSM module for SMS notifications.

For video monitoring, I integrated an ESP32-CAM module running a WebSocket server that streams JPEG frames at approximately 10 FPS. The camera connects directly to Firebase for device registration and streams video to the mobile app on demand.


## Mobile Application

I developed the mobile app using Flutter with Material Design 3, implementing real-time control interfaces for all connected devices. The app authenticates users through Firebase, then establishes WebSocket connections for video streaming and listens to database changes for instant status updates.

{{< terminal-figure src="smarthauslogin.jpg" alt="SmartHaus Login Screen" align="center">}}

The dashboard displays environmental sensor data, security logs, and device states. I built custom widgets for relay control, door lock management, and water level monitoring. Each action triggers immediate Firebase updates that propagate to the hardware within milliseconds.

{{< terminal-figure src="smarthausdashboard.jpg" alt="SmartHaus Smart Controls Interface" align="center">}}
{{< terminal-figure src="smarthaussmartcontrols.jpg" alt="SmartHaus Smart Controls Interface" align="center">}}


## Security Implementation

The biometric access system tracks authentication attempts and enforces a three-strike lockout policy. When a fingerprint scan fails, the system increments the failure counter in Firebase, activates a warning buzzer, and logs the attempt with a timestamp. After three failures, it triggers an SMS alert through the SIM800L module.

All successful authentications are logged with the authorized user's name and timestamp, creating a comprehensive access history. The mobile app displays these logs in real-time, allowing remote monitoring of entry events.

## Monitoring

I implemented water level sensing using a float switch connected to the NodeMCU. The sensor continuously monitors tank status and updates Firebase with the current state. When water levels drop below the threshold, the system automatically triggers the water relay on the Mega and sends SMS notifications.

The app displays historical water level data with color-coded status indicators, showing normal operation in green and alert conditions in red. This allows quick identification of potential issues before they become critical.

## Firebase Integration

Firebase serves as the central nervous system, handling authentication, real-time database operations, and push notifications. I structured the database to organize devices by type, with dedicated paths for fingerprint sensors, water monitors, and relay controls.

The database schema tracks device states, maintains operation logs with date-based organization, and stores configuration data like relay names and ESP32-CAM IP addresses. This structure supports efficient queries and enables the mobile app to subscribe only to relevant data paths.

## Tech Stack

**Hardware**: ESP8266 NodeMCU, Arduino Mega 2560, ESP32-CAM, GT-521F32 Fingerprint Sensor, SIM800L GSM Module, 8-Channel Relay Board

**Software**: Flutter 3.9.0+ (Dart), Firebase (Auth, Realtime Database, Cloud Messaging), PlatformIO, Arduino Framework

**Protocols**: WebSocket, I2C, UART, HTTP/HTTPS

**Tools**: VS Code, PlatformIO IDE, Firebase Console, Android Studio

## Source Code

The complete source code is available across three repositories:

- [SmartHaus-App](https://github.com/rul3zero/SmartHaus-App) — Flutter mobile application
- [SmartHaus-Sensors](https://github.com/rul3zero/SmartHaus-Sensors) — ESP8266/Arduino firmware
- [SmartHaus-WebsocketServer](https://github.com/rul3zero/SmartHaus-WebsocketServer) — ESP32-CAM streaming server

## Reflection

This project demonstrates practical IoT system design with real-world security requirements. Building SmartHaus taught me the importance of robust error handling in embedded systems, especially when dealing with network connectivity and hardware failures. The experience of integrating multiple protocols and platforms strengthened my full-stack development skills and deepened my understanding of real-time distributed systems.
