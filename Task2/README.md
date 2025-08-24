# Gas Station Transaction Form

A React application for entering gas station transaction data with form validation and modern UI design.

## Features

- **Transaction Data Entry**: Form for entering gas station transaction details
- **Form Validation**: Comprehensive validation using Yup schema validation
- **Date/Time Picker**: Interactive date and time selection
- **Auto-calculation**: Revenue automatically calculated from quantity and unit price
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Clear error messages and success notifications

## Form Fields

1. **Thời gian (Time)**: Date and time picker for transaction execution time
2. **Số lượng (Quantity)**: Number input for liters in transaction
3. **Trụ (Pump)**: Dropdown selection for pump number
4. **Doanh thu (Revenue)**: Auto-calculated total amount (read-only)
5. **Đơn giá (Unit Price)**: Number input for unit price per liter

## Technologies Used

- React 18
- Vite (Build tool)
- React Hook Form (Form management)
- Yup (Schema validation)
- React DatePicker (Date/time selection)
- CSS3 (Styling)

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository or navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Form Validation Rules

- **Time**: Required field
- **Quantity**: Required, must be a positive number
- **Pump**: Required, must select a pump from dropdown
- **Revenue**: Auto-calculated, read-only
- **Unit Price**: Required, must be a positive number

## Project Structure

```
src/
├── components/
│   ├── TransactionForm.jsx    # Main form component
│   └── TransactionForm.css    # Form styling
├── App.jsx                    # Main app component
├── App.css                    # App styling
├── main.jsx                   # Entry point
└── index.css                  # Global styles
```

## Usage

1. Fill in the transaction details
2. The revenue will be automatically calculated
3. Click "Cập nhật" (Update) to submit the form
4. Validation errors will be displayed if any fields are invalid
5. Success message will appear when form is submitted successfully

## Customization

- Modify pump options in the `pumpOptions` array in `TransactionForm.jsx`
- Adjust validation rules in the Yup schema
- Customize styling in the CSS files
- Add additional form fields as needed
