# ElderCare Connect

A community-driven web platform designed to connect elderly individuals and families with trusted caregivers who can provide daily assistance, companionship, and specialized senior care services.

---

# Overview

ElderCare Connect aims to improve the quality of life for elderly people by making it easier to find reliable caregivers for everyday tasks and personal assistance.

The platform allows:

* Families or seniors to post care needs
* Caregivers to offer services and qualifications
* Direct communication through chat
* Ratings and reviews for trust and transparency

The goal is to create a safe, accessible, and community-focused environment that supports both seniors and caregivers.

---

# Main Features

## User System

Two types of users are supported:

### Care Seekers

Users who need assistance for themselves or elderly family members.

### Caregivers

Users who provide elderly care services.

Each user profile contains:

* Name
* Email
* Description/About
* Profile Photo
* User Type
* Qualifications (caregivers only)

---

# Elderly Care Services

The platform supports multiple types of assistance, including:

* House Cleaning
* Personal Hygiene Assistance
* Companion Care
* Dementia Care
* Senior Transportation
* Assisted Living Support
* Post-Surgery Assistance
* Meal Preparation
* Morning & Night Assistance

---

# Core Entities

## USER

```ts
USER {
  id
  email
  name
  description
  photo
  userType
}
```

### User Types

```ts
CARE_SEEKER
CARE_GIVER
```

---

## CARE_GIVER

Additional information for caregivers:

```ts
CARE_GIVER {
  qualifications[]
}
```

---

## JOB_QUALITY ENUM

```ts
enum JobQuality {
  HOUSE_CLEANING,
  PERSONAL_HYGIENE,
  COMPANION,
  DEMENTIA_CARE,
  SENIOR_TRANSPORTATION,
  ASSISTED_LIVING,
  POST_SURGERY
}
```

---

## JOB_SERVICE

Service offers created by caregivers.

```ts
JOB_SERVICE {
  userId
  description
  location
  startDate
  endDate
  dailyTimePerWeekDay
  priceRange
  qualifications
}
```

---

## JOB_NEED

Requests created by elderly users or families.

```ts
JOB_NEED {
  userId
  description
  location
  startDate
  endDate
  dailyTimePerWeekDay
  priceRange
  qualificationsRequired
}
```

---

## CHAT

```ts
CHAT {
  recipients
  messages
}
```

---

## REVIEW

```ts
REVIEW {
  userId
  rating
  text
}
```

---

# Goals

* Help elderly people maintain independence and dignity
* Simplify access to trusted care services
* Support families in finding reliable caregivers
* Create employment opportunities for caregivers
* Reduce loneliness and improve daily well-being
* Build safer community connections through reviews and communication

---

# Future Improvements

Potential future features include:

* Identity verification
* Background checks
* Real-time notifications
* Video calls
* Emergency contact system
* Caregiver scheduling calendar
* Payment integration
* AI-based caregiver recommendations
* Accessibility improvements for seniors

---

# Tech Vision

The platform is designed to become a modern digital ecosystem for elderly care, combining:

* Human connection
* Accessibility
* Community trust
* Flexible caregiving opportunities
* Simple and intuitive technology

---

# License

This project is currently under development.
License information will be added in the future.