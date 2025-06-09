// No direct db import here, as operations are delegated to UserService via Commands
const RegisterUserCommand = require("../commands/RegisterUserCommand");
const LoginUserCommand = require("../commands/LoginUserCommand");
const RequestPasswordResetCommand = require("../commands/RequestPasswordResetCommand");
const UpdateProfileCommand = require("../commands/UpdateProfileCommand");
const GetUserProfileCommand = require("../commands/GetUserProfileCommand");

// Password Reset Functionality
const resetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const resetCommand = new RequestPasswordResetCommand(email);
    await resetCommand.execute();
    res.render("reset", { message: "Password reset email sent.", error: null });
  } catch (err) {
    console.error("Error in resetPassword (Controller):", err);
    res.render("reset", {
      error: "Error resetting password: " + err.message,
      message: null,
    });
  }
};

// Register User
const registerUser = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const registerCommand = new RegisterUserCommand(username, password, email);
    await registerCommand.execute();
    // After successful registration, redirect to the login page
    res.redirect("/login");
  } catch (err) {
    console.error("Error in registerUser (Controller):", err);
    res.render("register", {
      error: "Error registering user: " + err.message,
      message: null,
    });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const loginCommand = new LoginUserCommand(username, password);
    const user = await loginCommand.execute(); // Execute the command

    if (user) {
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
      };
      console.log("Login successful, redirecting...");
      return res.redirect("/select-year-month");
    } else {
      console.log("Invalid credentials or user not found.");
      return res.render("login", {
        error: "Invalid credentials.",
        message: null,
      });
    }
  } catch (err) {
    console.error("Error in loginUser (Controller):", err);
    return res.render("login", {
      error: "Error logging in: " + err.message,
      message: null,
    });
  }
};

const logoutUser = (req, res) => {
  // Logout is typically simple session destruction, no complex command needed unless
  // there are specific backend actions (e.g., logging logout event in DB)
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.redirect("/dashboard");
    }
    res.clearCookie("connect.sid");
    res.render("login", {
      message: "You have been logged out successfully.",
      error: null,
    });
  });
};

// Get Profile Controller
const getProfile = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  const userId = req.session.user.id;

  try {
    const getProfileCommand = new GetUserProfileCommand(userId);
    const user = await getProfileCommand.execute();

    if (user) {
      res.render("profile", { user, errorMessage: null, successMessage: null });
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    console.error("Error in getProfile (Controller):", err);
    res.status(500).send("Error loading profile: " + err.message);
  }
};

// Update Profile Controller
const updateProfile = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  const userId = req.session.user.id;
  const { email, password } = req.body;

  // Retrieve current user data to pass back in case of validation error
  let currentUser = null;
  try {
    const getProfileCommand = new GetUserProfileCommand(userId);
    currentUser = await getProfileCommand.execute();
  } catch (err) {
    console.error(
      "Error fetching current user for updateProfile context:",
      err
    );
    return res
      .status(500)
      .send("Internal Server Error during profile update setup.");
  }

  try {
    const updateCommand = new UpdateProfileCommand(userId, email, password);
    const updatedUser = await updateCommand.execute();

    if (updatedUser) {
      // Update session data with new email
      req.session.user.email = updatedUser.email;
      res.render("profile", {
        user: updatedUser,
        errorMessage: null,
        successMessage: "Profile successfully updated!",
      });
    } else {
      // If updatedUser is null, it means user not found/no rows affected by service
      res.render("profile", {
        user: currentUser, // Pass back original user if not found/updated
        errorMessage: "User not found or no changes made.",
        successMessage: null,
      });
    }
  } catch (err) {
    console.error("Error in updateProfile (Controller):", err);
    // Re-render profile page with error message, keeping original user data
    res.render("profile", {
      user: currentUser, // Pass back original user data in case of error
      errorMessage: "Error updating profile: " + err.message,
      successMessage: null,
    });
  }
};

module.exports = {
  resetPassword,
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
};
