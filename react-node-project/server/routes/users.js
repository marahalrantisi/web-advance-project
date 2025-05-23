const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken, checkRole } = require('../middleware/auth');

// الحصول على جميع المستخدمين
router.get('/', checkRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    
    // إضافة مرشح الدور إذا كان موجودًا
    if (role) filter.role = role;
    
    const users = await User.find(filter).select('-password').sort({ name: 1 });
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('خطأ في جلب المستخدمين:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب المستخدمين'
    });
  }
});

// الحصول على مستخدم محدد
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    // التحقق من الصلاحيات
    if (req.user.role === 'student' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول إلى بيانات هذا المستخدم'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('خطأ في جلب المستخدم:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب المستخدم'
    });
  }
});

// تحديث بيانات المستخدم
router.patch('/:id', async (req, res) => {
  try {
    const { name, email, role, avatar } = req.body;
    const userId = req.params.id;
    
    // التحقق من الصلاحيات
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لتحديث بيانات هذا المستخدم'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    // تحديث البيانات
    if (name) user.name = name;
    if (email) user.email = email;
    
    // فقط المسؤول يمكنه تغيير الدور
    if (role && req.user.role === 'admin') {
      user.role = role;
    }
    
    if (avatar) user.avatar = avatar;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'تم تحديث بيانات المستخدم بنجاح',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('خطأ في تحديث المستخدم:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث المستخدم'
    });
  }
});

// تغيير كلمة المرور
router.post('/:id/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id;
    
    // التحقق من الصلاحيات
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لتغيير كلمة مرور هذا المستخدم'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    // التحقق من كلمة المرور الحالية (إلا إذا كان المستخدم مسؤولًا)
    if (req.user.role !== 'admin') {
      const isMatch = await user.comparePassword(currentPassword);
      
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'كلمة المرور الحالية غير صحيحة'
        });
      }
    }
    
    // تحديث كلمة المرور
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تغيير كلمة المرور:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تغيير كلمة المرور'
    });
  }
});

// حذف مستخدم
router.delete('/:id', checkRole(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    await user.remove();
    
    res.json({
      success: true,
      message: 'تم حذف المستخدم بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حذف المستخدم:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف المستخدم'
    });
  }
});

module.exports = router;
