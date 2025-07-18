import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext"; // Verify the path is correct

import Layout from "./routes/layout/layout";
import HomePage from "./routes/homePage/homePage";
import ListPage from "./routes/listPage/listPage";
import SinglePage from "./routes/singlePage/singlePage";
import ProfilePage from "./routes/profilePage/profilePage";
import ProfileUpdatePage from "./routes/profileUpdatePage/profileUpdatePage";
import Login from "./routes/login/login";
import Register from "./routes/register/register";
import NewPostPage from "./routes/newPostPage/newPostPage";

// Import loaders
import { listPageLoader, profilePageLoader, singlePageLoader } from "./lib/loaders";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <h1>Oops! Something went wrong.</h1>, // Improved error handling
      children: [
        { index: true, element: <HomePage /> }, // Default home page
        { path: "list", element: <ListPage />, loader: listPageLoader },
        { path: "/:id", element: <SinglePage />, loader: singlePageLoader }, // Add loader here
        {
          path: "profile",
          element: <ProfilePage />,
          loader: profilePageLoader, // Load profile data
        },
        { path: "profile/update", element: <ProfileUpdatePage /> },
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },
        { path: "add", element: <NewPostPage /> },
      ],
    },
  ]);

  return (
    <AuthContextProvider>
      <RouterProvider router={router} fallbackElement={<h1>Loading...</h1>} />
    </AuthContextProvider>
  );
}

export default App;
