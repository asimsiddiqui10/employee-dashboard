import User from '../models/User.js';
import Employee from '../models/Employee.js';

// Switch active role for a user
export const switchRole = async (req, res) => {
  try {
    const { newRole } = req.body;
    const userId = req.user._id;

    if (!newRole) {
      return res.status(400).json({
        success: false,
        message: 'New role is required'
      });
    }

    // Find the user and populate employee data
    const user = await User.findById(userId).populate('employee');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has the requested role
    if (!user.hasRole(newRole)) {
      return res.status(403).json({
        success: false,
        message: `You don't have access to the ${newRole} role`,
        availableRoles: user.roles
      });
    }

    // Switch the role
    const switched = user.switchRole(newRole);
    if (!switched) {
      return res.status(400).json({
        success: false,
        message: 'Failed to switch role'
      });
    }

    // Save the user with new active role
    await user.save();

    // Also update the employee record if it exists
    if (user.employee) {
      const employee = await Employee.findById(user.employee._id);
      if (employee && employee.switchRole) {
        employee.switchRole(newRole);
        await employee.save();
      }
    }

    res.json({
      success: true,
      message: `Successfully switched to ${newRole} role`,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        activeRole: user.activeRole,
        employee: user.employee
      }
    });

  } catch (error) {
    console.error('Error switching role:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get current user's role information
export const getCurrentUserRoles = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .select('-password')
      .populate('employee');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        activeRole: user.activeRole,
        canSwitchRoles: user.roles && user.roles.length > 1,
        employee: user.employee
      }
    });

  } catch (error) {
    console.error('Error getting user roles:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Add role to a user (admin only)
export const addRoleToUser = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: 'User ID and role are required'
      });
    }

    // Check if the requesting user is admin
    if (!req.hasRole('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can add roles to users'
      });
    }

    const user = await User.findById(userId).populate('employee');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add the role
    user.addRole(role);
    await user.save();

    // Also update employee record if it exists
    if (user.employee) {
      const employee = await Employee.findById(user.employee._id);
      if (employee && employee.addRole) {
        employee.addRole(role);
        await employee.save();
      }
    }

    res.json({
      success: true,
      message: `Successfully added ${role} role to user`,
      data: {
        userId: user._id,
        name: user.name,
        roles: user.roles,
        activeRole: user.activeRole
      }
    });

  } catch (error) {
    console.error('Error adding role to user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Remove role from a user (admin only)
export const removeRoleFromUser = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: 'User ID and role are required'
      });
    }

    // Check if the requesting user is admin
    if (!req.hasRole('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can remove roles from users'
      });
    }

    const user = await User.findById(userId).populate('employee');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow removing the last role
    if (user.roles && user.roles.length <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the last role from a user'
      });
    }

    // Remove the role
    user.removeRole(role);
    await user.save();

    // Also update employee record if it exists
    if (user.employee) {
      const employee = await Employee.findById(user.employee._id);
      if (employee && employee.removeRole) {
        employee.removeRole(role);
        await employee.save();
      }
    }

    res.json({
      success: true,
      message: `Successfully removed ${role} role from user`,
      data: {
        userId: user._id,
        name: user.name,
        roles: user.roles,
        activeRole: user.activeRole
      }
    });

  } catch (error) {
    console.error('Error removing role from user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all users with their roles (admin only)
export const getAllUsersWithRoles = async (req, res) => {
  try {
    // Check if the requesting user is admin
    if (!req.hasRole('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view all users'
      });
    }

    const users = await User.find()
      .select('-password')
      .populate('employee', 'name employeeId department position')
      .sort({ name: 1 });

    const usersWithRoleInfo = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      activeRole: user.activeRole,
      canSwitchRoles: user.roles && user.roles.length > 1,
      employee: user.employee,
      createdAt: user.createdAt
    }));

    res.json({
      success: true,
      data: usersWithRoleInfo,
      count: usersWithRoleInfo.length
    });

  } catch (error) {
    console.error('Error getting all users with roles:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}; 