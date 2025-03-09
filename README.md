# Playtorium Assignment

Playtorium assignment: Cart discount module implementation using NestJS

## Author
Apichon Changkong

## Installation
Clone the repository:
```bash
git clone https://github.com/nohcipassob/playtorium-cart-discount.git
cd playtorium-cart-discount
```
### Install dependencies:
```bash
npm install
```
## Runnung the Application
### Development Mode
```bash
npm run start:dev
```
### Using Docker
```bash
docker build -t playtorium-products .
docker run -d -p 3000:3000 --name playtorium-products playtorium-products
```
## API Documnetation
API Documentation
A Postman collection is included with this project to help you explore and test the available endpoints.
## Request Body Structure
Below is the structure of the request body for discount calculation:
```json
{
    "cart": {
        "items": [
            {
                "id": "1",
                "name": "T-Shirt",
                "price": 350,
                "category": "Clothing",
                "quantity": 1
            },
            {
                "id": "2",
                "name": "Hoodie",
                "price": 700,
                "category": "Clothing",
                "quantity": 1
            },
            {
                "id": "3",
                "name": "Watch",
                "price": 850,
                "category": "Accessories",
                "quantity": 1
            },
            {
                "id": "4",
                "name": "Bag",
                "price": 640,
                "category": "Accessories",
                "quantity": 1
            }
        ],
        "customerPoints": 200
    },
    "discounts": {
        "coupon": [
            {
                "id": "coupon1",
                "name": "10% Off Entire Purchase",
                "category": "Coupon",
                "type": "PercentageDiscount",
                "parameters": {
                    "percentage": 10
                }
            }
        ],
        "onTop": [
            {
                "id": "ontop1",
                "name": "15% Off Clothing",
                "category": "OnTop",
                "type": "PercentageDiscountByItemCategory",
                "parameters": {
                    "category": "Clothing",
                    "percentage": 15
                }
            }
        ],
        "seasonal": [
            {
                "id": "seasonal1",
                "name": "Every 1000 THB get 100 THB off",
                "category": "Seasonal",
                "type": "SpecialCampaigns",
                "parameters": {
                    "everyXTHB": 1000,
                    "discountYTHB": 100
                }
            }
        ]
    }
}
```
## Testing
```bash
npm run test
```
