const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { verifyToken } = require('../middleware/auth');

// الحصول على جميع الإشعارات للمستخدم الحالي
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('خطأ في جلب الإشعارات:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الإشعارات'
    });
  }
});

// تحديد إشعار كمقروء
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'الإشعار غير موجود'
      });
    }
    
    // التحقق من أن الإشعار ينتمي للمستخدم الحالي
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول إلى هذا الإشعار'
      });
    }
    
    notification.read = true;
    await notification.save();
    
    res.json({
      success: true,
      message: 'تم تحديث حالة الإشعار بنجاح',
      notification
    });
  } catch (error) {
    console.error('خطأ في تحديث حالة الإشعار:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث حالة الإشعار'
    });
  }
});

// تحديد جميع الإشعارات كمقروءة
router.patch('/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );
    
    res.json({
      success: true,
      message: 'تم تحديث جميع الإشعارات كمقروءة بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تحديث حالة الإشعارات:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث حالة الإشعارات'
    });
  }
});

// حذف إشعار
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'الإشعار غير موجود'
      });
    }
    
    // التحقق من أن الإشعار ينتمي للمستخدم الحالي
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لحذف هذا الإشعار'
      });
    }
    
    await notification.remove();
    
    res.json({
      success: true,
      message: 'تم حذف الإشعار بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حذف الإشعار:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف الإشعار'
    });
  }
});

// حذف جميع الإشعارات
router.delete('/', async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    
    res.json({
      success: true,
      message: 'تم حذف جميع الإشعارات بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حذف الإشعارات:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف الإشعارات'
    });
  }
});

module.exports = router;
