# Smart Recipe & Nutrition Tracker

A comprehensive web application that uses advanced AI algorithms to provide personalized recipe recommendations, nutrition tracking, and meal planning. Built with Bootstrap, ECharts, Firebase, and custom machine learning algorithms.

## 🚀 Features

### ✅ **All Required Technologies Implemented**
- **Bootstrap 5**: Responsive design, navigation, forms, and components
- **ECharts**: Interactive charts for nutrition, health trends, and analytics  
- **Firebase**: Real-time database, authentication, and cloud storage
- **AI Algorithms**: K-means clustering, linear regression, collaborative filtering, decision trees

### 🎯 **Six Complete Web Pages**

1. **🔍 Recipe Discovery** - AI-powered recipe recommendations using clustering algorithms
2. **📊 Nutrition Dashboard** - Real-time nutrition tracking with predictive analytics
3. **📅 Meal Planner** - Optimized weekly meal planning using genetic algorithms
4. **🛒 Shopping List** - Smart grocery lists with route optimization
5. **❤️ Health Tracker** - Health metrics analysis with trend predictions
6. **👨‍🍳 Recipe Creator** - Community recipe sharing with AI nutrition analysis

### 🤖 **Advanced AI Algorithms**

- **K-Means Clustering**: Groups recipes by nutritional similarity and user preferences
- **Linear Regression**: Predicts nutrition goals and health outcomes
- **Collaborative Filtering**: Recommends recipes based on similar user preferences
- **Decision Trees**: Optimizes meal selection based on multiple constraints
- **Time Series Analysis**: Analyzes health trends and predicts future metrics
- **Genetic Algorithm**: Optimizes weekly meal plans for nutrition, budget, and preferences

## 📁 Project Structure

```
smart-recipe-tracker/
├── index.html                 # Main HTML file with all pages
├── css/
│   └── styles.css            # Custom CSS with animations and themes
├── js/
│   ├── app.js                # Main application logic and coordination
│   ├── ai-algorithms.js      # Machine learning algorithms implementation
│   ├── firebase-config.js    # Firebase setup and database operations
│   ├── nutrition-tracker.js  # Nutrition tracking with AI insights
│   ├── meal-planner.js       # AI meal planning with optimization
│   └── charts.js             # ECharts configuration and visualization
├── data/
│   ├── recipes.json          # Comprehensive recipe database
│   ├── nutrition-db.json     # Detailed nutrition information
│   └── sample-data.json      # Sample user data for testing
└── README.md                 # This file
```

## 🛠️ Setup Instructions

### 1. **Firebase Configuration**

1. Create a new Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore Database** and **Authentication**
3. Copy your Firebase configuration object
4. Replace the configuration in `js/firebase-config.js`:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com", 
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

### 2. **Firestore Database Setup**

Create the following collections in your Firestore database:

```
- recipes/
- nutritionLogs/
- healthMetrics/
- mealPlans/
- shoppingLists/
- userPreferences/
- recipeRatings/
```

### 3. **Firebase Security Rules**

Set up basic security rules in Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. **Authentication Setup**

Enable **Anonymous Authentication** in Firebase Console:
- Go to Authentication > Sign-in method
- Enable Anonymous authentication
- This allows users to use the app without registration

### 5. **Local Development**

1. **Clone/Download** all project files to your local directory
2. **Open** `index.html` in a modern web browser
3. The app will automatically sign in anonymously and initialize AI algorithms

### 6. **Web Server Setup (Optional)**

For full functionality, serve the files through a web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (install live-server globally)
npm install -g live-server
live-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 🔧 Configuration Options

### **User Preferences**
Customize the app behavior by modifying preferences in the UI:
- Daily calorie targets
- Protein goals  
- Cooking time limits
- Dietary restrictions
- Budget constraints
- Family size

### **AI Algorithm Parameters**
Adjust AI behavior in `js/ai-algorithms.js`:
- K-means cluster count
- Regression learning rate
- Collaborative filtering similarity threshold
- Genetic algorithm population size

## 🎨 Features Overview

### **AI Recipe Discovery**
- Real-time preference analysis
- Multi-algorithm recommendation engine
- Nutrition-based recipe clustering
- User similarity matching

### **Smart Nutrition Tracking**
- AI-powered food search with auto-suggestions
- Real-time nutrition goal tracking
- Predictive nutrition analytics
- Meal satisfaction scoring

### **Optimized Meal Planning**
- Multi-objective optimization (nutrition, cost, time)
- Genetic algorithm for weekly plans
- Dietary restriction compliance
- Meal prep optimization

### **Intelligent Shopping Lists**
- Automatic list generation from meal plans
- Cost estimation and budget tracking
- Store layout route optimization
- Category-based organization

### **Health Analytics**
- Trend analysis with time series algorithms
- Predictive health metrics
- Correlation analysis (nutrition ↔ health)
- Goal progress tracking

### **Community Features**
- Recipe sharing and rating
- Nutrition analysis for user recipes
- Community recipe recommendations
- Social nutrition insights

## 📊 AI Algorithm Details

### **K-Means Clustering**
- **Purpose**: Groups recipes by nutritional similarity
- **Features**: [calories, protein, carbs, fat, cooking_time]
- **Implementation**: Custom Euclidean distance with convergence detection
- **Output**: Recipe clusters with nutritional characteristics

### **Linear Regression**
- **Purpose**: Predicts meal satisfaction and nutrition needs
- **Method**: Normal equation with matrix operations
- **Features**: Nutrition content, user preferences, meal timing
- **Output**: Satisfaction scores and goal predictions

### **Collaborative Filtering**
- **Purpose**: Recommends recipes based on user similarity
- **Method**: Cosine similarity between user preference vectors
- **Implementation**: User-based collaborative filtering
- **Output**: Personalized recipe recommendations

### **Decision Tree**
- **Purpose**: Rule-based meal selection optimization
- **Constraints**: Budget, time, dietary restrictions, nutrition goals
- **Implementation**: Rule engine with scoring system
- **Output**: Filtered and ranked recipe suggestions

### **Genetic Algorithm**
- **Purpose**: Optimizes weekly meal plans
- **Chromosome**: 7-day meal plan with 3 meals per day
- **Fitness**: Multi-objective (nutrition, cost, variety, time)
- **Operations**: Tournament selection, crossover, mutation
- **Output**: Optimized weekly meal plan

## 🎯 Usage Examples

### **Getting AI Recipe Recommendations**
1. Navigate to Discovery page
2. Set your preferences (calories, time, dietary restrictions)
3. Click "Run AI Analysis"  
4. View algorithm results and recommended recipes
5. Add favorites to meal plan

### **Tracking Nutrition with AI Insights**
1. Go to Nutrition Dashboard
2. Search and log foods (auto-suggestions provided)
3. View real-time progress charts
4. Check AI predictions and recommendations
5. Track trends over time

### **Creating Optimized Meal Plans**
1. Access Meal Planner page
2. Set planning parameters (budget, family size, preferences)
3. Click "Generate AI Plan"
4. Review optimization metrics and weekly plan
5. Export to calendar or shopping list

### **Smart Shopping List Generation**
1. Navigate to Shopping page
2. Lists auto-generate from meal plans
3. View cost analysis and budget usage
4. Optimize shopping route
5. Check off items as you shop

## 🔍 Data Sources

### **Recipe Database**
- 10+ detailed recipes with full nutrition information
- Multiple cuisines and dietary options
- Difficulty levels and cooking times
- Cost estimates and serving information

### **Nutrition Database**  
- Comprehensive food nutrition data
- Macro and micronutrient information
- Serving sizes and cost estimates
- Seasonal availability and sustainability scores

### **Sample User Data**
- Demo user profiles with different goals
- Historical nutrition and health data
- Recipe ratings and preferences
- Meal plans and shopping lists

## 🚀 Deployment Options

### **Firebase Hosting** (Recommended)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### **GitHub Pages**
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select source branch (main/master)
4. Access via `https://username.github.io/repository-name`

### **Netlify**
1. Connect GitHub repository to Netlify
2. Set build command: (none needed)
3. Set publish directory: `/` (root)
4. Deploy automatically on push

## 🧪 Testing

### **AI Algorithm Testing**
- Open browser console to see algorithm outputs
- Test different user preferences
- Verify clustering and recommendation results
- Check optimization scores and metrics

### **Database Operations**
- Test meal logging and data persistence
- Verify real-time data synchronization
- Check user preference saving/loading
- Test meal plan and shopping list generation

### **UI/UX Testing**
- Test responsive design on different screen sizes
- Verify chart interactions and animations
- Test navigation between pages
- Check form validation and error handling

## 🔧 Troubleshooting

### **Firebase Connection Issues**
- Verify API keys and project configuration
- Check internet connectivity
- Ensure Firestore rules allow read/write access
- Check browser console for error messages

### **AI Algorithm Performance**
- Algorithms initialize on page load
- Check console for "AI models trained successfully" message
- Verify sample data is loading properly
- Test with different preference combinations

### **Chart Display Issues**
- Ensure ECharts library loads properly
- Check for JavaScript errors in console
- Verify chart containers exist in DOM
- Test page refresh if charts don't appear

## 📈 Future Enhancements

- **Advanced ML Models**: Deep learning for more accurate predictions
- **Computer Vision**: Recipe analysis from food photos
- **IoT Integration**: Smart kitchen device connectivity
- **Social Features**: Enhanced community sharing and challenges
- **Mobile App**: React Native or Flutter mobile application
- **API Integration**: External nutrition databases and grocery APIs

## 📄 License

This project is created for educational purposes. All AI algorithms are custom implementations designed to demonstrate machine learning concepts in web development.

## 🤝 Contributing

Feel free to fork this project and submit pull requests with improvements:
- Additional AI algorithms
- New recipe and nutrition data
- Enhanced UI/UX features
- Performance optimizations
- Bug fixes and improvements

---

**Built with ❤️ using Bootstrap, ECharts, Firebase, and custom AI algorithms**