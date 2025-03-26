import User from "./models/User.js"
import bcrypt from "bcrypt"
import connectToDatabase from "./db/db.js"
import { config } from 'dotenv'

// Load environment variables
config()

const userRegister = async () => {
    try {
        await connectToDatabase()
        console.log("Connected to database")
        
        // Check if admin user already exists
        const existingAdmin = await User.findOne({ email: "admin@act.com" })
        if (!existingAdmin) {
            const adminHashPassword = await bcrypt.hash("admin", 10)
            const newAdmin = new User({
                name: "Admin",
                email: "admin@act.com",
                password: adminHashPassword,
                role: "admin",
                profileImage: "https://via.placeholder.com/150"
            })
            await newAdmin.save()
            console.log("Admin user created successfully")
        } else {
            console.log("Admin user already exists")
        }
        
        // Check if employee user already exists
        const existingEmployee = await User.findOne({ email: "employee@act.com" })
        if (!existingEmployee) {
            const employeeHashPassword = await bcrypt.hash("employee", 10)
            const newEmployee = new User({
                name: "John Doe",
                email: "employee@act.com",
                password: employeeHashPassword,
                role: "employee",
                profileImage: "https://via.placeholder.com/150"
            })
            await newEmployee.save()
            console.log("Employee user created successfully")
        } else {
            console.log("Employee user already exists")
        }
    } catch (error) {
        console.log("Error:", error)
    } finally {
        process.exit(0)
    }
}

userRegister()