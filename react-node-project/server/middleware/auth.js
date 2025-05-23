const jwt = require('jsonwebtoken');
const User = require('../models/User');

// التحقق من صحة رمز JWT
const verifyToken = async (req, res, next) => {
  try {
    // الحصول على الرمز من رأس الطلب
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'الوصول مرفوض. يرجى تسجيل الدخول.' 
      });
    }
    
    // التحقق من صحة الرمز
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // البحث عن المستخدم
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'المستخدم غير موجود.' 
      });
    }
    
    // إضافة بيانات المستخدم إلى الطلب
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('خطأ في التحقق من الرمز:', error);
    res.status(401).json({ 
      success: false, 
      message: 'الرمز غير صالح أو منتهي الصلاحية.' 
    });
  }
};

// التحقق من دور المستخدم
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'الوصول مرفوض. يرجى تسجيل الدخول.' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'ليس لديك صلاحية للوصول إلى هذا المورد.' 
      });
    }
    
    next();
  };
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'الوصول مرفوض. يرجى تسجيل الدخول.' 
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'الوصول مرفوض. صلاحية أدمن مطلوبة.' 
    });
  }
  
  next();
};

module.exports = {
  verifyToken,
  checkRole,
  isAdmin
};
