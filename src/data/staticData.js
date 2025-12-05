export const filterOptions = [
    { id: 1, name: "Onion", count: 7, image: "/images/onion.png" },
    { id: 2, name: "Banana", count: 2, image: "/images/banana.png" },
    { id: 3, name: "Apple", count: 2, image: "/images/apple.png" },
    { id: 4, name: "Grapes", count: 1, image: "/images/grapes.png" },
    { id: 5, name: "Mango", count: 3, image: "/images/mango.png" },
    { id: 6, name: "Orange", count: 4, image: "/images/orange.png" },
    { id: 7, name: "Potato", count: 5, image: "/images/potato.png" },
    { id: 8, name: "Tomato", count: 6, image: "/images/tomato.png" },
    { id: 9, name: "Carrot", count: 2, image: "/images/carrot.png" },
    { id: 10, name: "Cabbage", count: 1, image: "/images/cabbage.png" },
    { id: 11, name: "Cauliflower", count: 3, image: "/images/cauliflower.png" },
    { id: 12, name: "Broccoli", count: 2, image: "/images/broccoli.png" },
    { id: 13, name: "Cucumber", count: 4, image: "/images/cucumber.png" },
    { id: 14, name: "Lettuce", count: 2, image: "/images/lettuce.png" },
    { id: 15, name: "Spinach", count: 3, image: "/images/spinach.png" },
];

export const SortOptions = [
    { id: "relevance", label: "Relevance (default)" },
    { id: "lowToHigh", label: "Price (Low to High)" },
    { id: "highToLow", label: "Price (High to Low)" },
    { id: "newest", label: "Newest First" },
];

export const addressJSON = [
    {
        title: "Home",
        address: "123 Main Street, Block A",
        city: "New York",
        state: "NY",
        pincode: "10001",
        phone: "+1 212-555-1234"
    },
    {
        title: "Work",
        address: "456 Market Road, Floor 5",
        city: "San Francisco",
        state: "CA",
        pincode: "94105",
        phone: "+1 415-555-5678"
    },
    {
        title: "Parents' House",
        address: "78 Rose Garden, Near City Park",
        city: "Austin",
        state: "TX",
        pincode: "73301",
        phone: "+1 737-555-7890"
    },
    {
        title: "Parents' House",
        address: "78 Rose Garden, Near City Park",
        city: "Austin",
        state: "TX",
        pincode: "73301",
        phone: "+1 737-555-7890"
    },{
        title: "Parents' House",
        address: "78 Rose Garden, Near City Park",
        city: "Austin",
        state: "TX",
        pincode: "73301",
        phone: "+1 737-555-7890"
    }
]


export const sections = [
    {
        id: "about",
        title: "About Us",
        content: [
            "Welcome to Q8 Basket! We are your one-stop solution for fresh, organic fruits and vegetables delivered directly to your doorstep.",
            "Our mission is to make healthy eating accessible and affordable for everyone. We source our produce directly from local farms and ensure everything is fresh and sustainably grown.",
            "At Q8 Basket, we believe in quality, transparency, and customer satisfaction. Thank you for being a part of our journey!"
        ]
    },
    {
        id: "privacy",
        title: "Privacy Policy",
        content: [
            "We respect your privacy and are committed to protecting your personal data.",
            "Your information is only used to provide and improve our services. We never sell your data to third parties."
        ]
    },
    {
        id: "terms",
        title: "Terms & Conditions",
        content: [
            "By using Q8 Basket, you agree to comply with our terms of service.",
            "We reserve the right to update our terms and policies as needed without prior notice."
        ]
    }
];

export const addressTypes = [
  {
    id: "home",
    label: "Home",
    icon: "/icons/home.svg",
  },
  {
    id: "work",
    label: "Work",
    icon: "/icons/bag.svg",
  },
  {
    id: "hotel",
    label: "Hotel",
    icon: "/icons/home.svg",
  },
  {
    id: "other",
    label: "Other",
    icon: "/icons/location.svg",
  },
];

export const coupons = [
    {
        id: 1,
        title: "20% Off Sitewide",
        code: "SAVE20",
        discount: "20%",
        description: "Get 20% off on all products sitewide.",
        conditions: "No minimum order value is required"
    },
    {
        id: 2,
        title: "$10 Off Orders Over $50",
        code: "SAVE10",
        discount: "$10",
        description: "Save $10 when your cart total exceeds $50.",
        conditions: "Minimum order value must be $50"
    },
    {
        id: 3,
        title: "Free Shipping on All Orders",
        code: "FREESHIP",
        discount: "Free Shipping",
        description: "Enjoy free standard shipping across all orders.",
        conditions: "No minimum order value is required"
    },
    {
        id: 4,
        title: "Flat ₹200 Off on Prepaid Orders",
        code: "FLAT200",
        discount: "₹200",
        description: "Get a flat ₹200 off when you pay online.",
        conditions: "Offer valid on prepaid orders only"
    },
    {
        id: 5,
        title: "Buy 1 Get 1 Free on Select Items",
        code: "BOGO2025",
        discount: "BOGO",
        description: "Buy one product and get another free from the same category.",
        conditions: "Valid only on selected categories"
    }
];
