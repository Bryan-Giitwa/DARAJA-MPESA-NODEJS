# DARAJA-MPESA-NODEJS

In this project, I'll be exploring Mpesa API integration with Nodejs. Mpesa is a mobile payment platform used in Kenya, and integrating it with your web application can provide your users with a seamless payment experience.

## API Endpoints

### Base URL

```
http://localhost:8000/api
```

### 1. Health Check

**GET** `/`

Returns a simple message to test if the server is running.

**Response:**

```
Hello From Daraja Api
```

### 2. Get Access Token

**GET** `/get-token`

Retrieves an access token from Safaricom's OAuth API.

**Response:**

```json
{
  "access_token": "your_access_token_here"
}
```

### 3. STK Push (Lipa na M-Pesa)

**POST** `/stk-push`

Initiates an STK push request to the user's phone for payment.

**Request Body:**

```json
{
  "phone": "703816487",
  "amount": 5
}
```

**Parameters:**

- `phone` (string, required): Phone number without country code (e.g., "703816487")
- `amount` (number, required): Amount to be paid (minimum 1 KES)

**Success Response (200):**

```json
{
  "MerchantRequestID": "29115-34620561-1",
  "CheckoutRequestID": "ws_CO_191220191020363925",
  "ResponseCode": "0",
  "ResponseDescription": "Success. Request accepted for processing",
  "CustomerMessage": "Success. Request accepted for processing"
}
```

**Error Response (400):**

```json
{
  "error": "Phone number and amount are required"
}
```

**Error Response (400 - Invalid Phone):**

```json
{
  "error": "Invalid phone number format. Use format: 0712345678 or 254712345678"
}
```

**Error Response (400 - API Error):**

```json
{
  "error": "Bad Request - Invalid PhoneNumber",
  "errorCode": "400.002.02",
  "requestId": "2538-4505-83bc-f3bbf3befd787416189"
}
```

## Phone Number Format

The API accepts phone numbers in the following formats:

- `0712345678` - Local format (converted to 254712345678)
- `254712345678` - International format
- `+254712345678` - International format with plus sign

## Environment Variables

Create a `.env` file with the following variables:

```env
PORT=8000
SHORTCODE=your_shortcode
PASSKEY=your_passkey
SECRET_KEY=your_secret_key
CONSUMER_KEY=your_consumer_key
```
