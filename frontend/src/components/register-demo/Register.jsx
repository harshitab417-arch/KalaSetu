import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onFormSubmit = async (data) => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    const response = await axios.put(
      "http://localhost:5000/auth/upgrade-role",
      {
        userId: storedUser._id,
        newRole: data.userType.toLowerCase(), // artisan or ngo
      }
    );

    // Update localStorage with new role
    localStorage.setItem("user", JSON.stringify(response.data.user));

    alert("Profile created successfully!");
    navigate("/home");

  } catch (error) {
    alert("Something went wrong while upgrading role.");
  }
};


  return (
    <div className="theme-bg">
      <nav className="navbar">
        <h1 className="brand-title">KalaSetu</h1>
        <div className="nav-buttons">
          <button onClick={() => navigate("/home")}>Back</button>
          <button onClick={() => navigate("/")}>Logout</button>
        </div>
      </nav>
      <div className="container-fluid d-flex justify-content-center">
        <div className="row w-100 justify-content-center">
          <div className="col-lg-6 col-xl-5">
            <div className="card theme-card shadow-lg">
              <div className="row g-0">
                <div className="col-12 p-5">

                  <h2 className="theme-title mb-2 text-center">Join KalaSetu</h2>
                  <p className="subtitle mb-4 text-center">Share your culture with the world</p>

                  <form onSubmit={handleSubmit(onFormSubmit)}>
                    <div className="mb-3">
                      <label className="form-label theme-label">Name</label>
                      <input
                        type="text"
                        className="form-control custom-input"
                        placeholder="Enter your full name"
                        {...register("name", { required: true })}
                      />
                      {errors.name && (
                        <small className="text-danger">Name is required</small>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label theme-label">Age</label>
                      <input
                        type="number"
                        className="form-control custom-input"
                        placeholder="Enter your age"
                        {...register("age", {
                          required: true,
                          min: 12, max: 100,
                        })}
                      />
                      {errors.age && (
                        <small className="text-danger">Enter a valid age</small>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label theme-label">Gender</label>
                      <select
                        {...register("gender", { required: true })}
                      >
                        <option value="">Select</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                      {errors.gender && (
                        <small className="text-danger">
                          Gender is required
                        </small>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label theme-label">Skills / Art Form</label>
                      <input
                        type="text"
                        className="form-control custom-input"
                        placeholder="Eg: Handloom, Folk Dance"
                        {...register("skills", { required: true })}
                      />
                      {errors.skills && (
                        <small className="text-danger">Skills are required</small>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label theme-label">Location</label>
                      <input
                        type="text"
                        className="form-control custom-input"
                        {...register("location", { required: true })}
                      />
                      {errors.location && (
                        <small className="text-danger">Location is required</small>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label theme-label">About Me</label>
                      <textarea
                        placeholder="Tell us about your cultural journey..."
                        {...register("about", { required: true })}
                      />
                      {errors.about && (
                        <small className="text-danger">This field is required</small>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label theme-label">
                        User Type
                      </label>
                      <select
                        {...register("userType", { required: true })}>
                        <option value="">Select user type</option>
                        <option>Artisan</option>
                        <option>NGO</option>
                      </select>
                      {errors.userType && (
                        <small className="text-danger">Select a user type</small>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label theme-label">Profile Photo</label>
                      <input
                        type="file"
                        className="form-control custom-input"
                        {...register("photo")}
                      />
                    </div>

                    <button className="btn theme-btn w-100 mb-3">Create Profile</button>

                  </form>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
