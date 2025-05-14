# Cart Nestjs


## Installation
Clone the repository:
```bash
***
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
docker build -t [] .
docker run -d -p 3000:3000 --name [] []
```
## API Documnetation
API Documentation
A Postman collection is included with this project to help you explore and test the available endpoints.
>[!NOTE]
> Postman collection inside /docs directory
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
## Request Body Structure:
| Field             | Type    | Description                                                              |
| ----------------- | ------- | ------------------------------------------------------------------------ |
| `cart.items`      | Array   | List of items in the cart                                                |
| `cart.items[].id` | String  | Unique identifier for the item                                           |
| `cart.items[].name` | String | Name of the item                                                         |
| `cart.items[].price` | Number | Price of the item in THB                                                |
| `cart.items[].category` | String | Category of the item (e.g., "Clothing", "Accessories")                  |
| `cart.items[].quantity` | Number | Quantity of the item in the cart                                        |
| `cart.customerPoints` | Number | Points accumulated by the customer that can be used for discounts       |

### discounts (Object)
Contains different types of applicable discounts.

| Field               | Type   | Description                                                    |
| ------------------- | ------ | -------------------------------------------------------------- |
| `discounts.coupon`   | Array  | List of coupon discounts                                       |
| `discounts.onTop`    | Array  | List of on-top discounts                                       |
| `discounts.seasonal` | Array  | List of seasonal discounts                                     |

## Discount Types

### PercentageDiscount
| Field        | Type    | Description                                                |
| ------------ | ------- | ---------------------------------------------------------- |
| `percentage` | Number  | Applies a percentage discount to the entire purchase       |

### PercentageDiscountByItemCategory
| Field       | Type    | Description                                                |
| ----------- | ------- | ---------------------------------------------------------- |
| `category`  | String  | Applies a percentage discount to items of a specific category (e.g., "Clothing") |
| `percentage`| Number  | Percentage discount applied to items in the specified category |

### SpecialCampaigns
| Field        | Type    | Description                                                |
| ------------ | ------- | ---------------------------------------------------------- |
| `everyXTHB`  | Number  | For every X THB spent, Y THB is discounted                 |
| `discountYTHB` | Number | Amount of discount (Y THB) applied for every X THB spent   |

## Testing
```bash
npm run test
```
