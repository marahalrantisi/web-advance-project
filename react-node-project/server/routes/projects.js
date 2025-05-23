const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const { verifyToken, checkRole } = require('../middleware/auth');

// الحصول على جميع المشاريع
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    
    // إضافة المرشحات إذا كانت موجودة
    if (status) filter.status = status;
    
    // إضافة مرشح المستخدم الحالي إذا كان طالبًا
    if (req.user.role === 'student') {
      filter.team = req.user._id;
    }
    
    const projects = await Project.find(filter)
      .populate('createdBy', 'name email')
      .populate('team', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      projects
    });
  } catch (error) {
    console.error('خطأ في جلب المشاريع:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب المشاريع'
    });
  }
});

// إنشاء مشروع جديد
router.post('/', checkRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { name, description, status, startDate, endDate, team } = req.body;
    
    const project = new Project({
      name,
      description,
      status,
      startDate,
      endDate,
      team,
      createdBy: req.user._id
    });
    
    await project.save();
    
    res.status(201).json({
      success: true,
      message: 'تم إنشاء المشروع بنجاح',
      project
    });
  } catch (error) {
    console.error('خطأ في إنشاء المشروع:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء المشروع'
    });
  }
});

// الحصول على مشروع محدد
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('team', 'name email');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'المشروع غير موجود'
      });
    }
    
    // التحقق من الصلاحيات
    if (req.user.role === 'student' && 
        !project.team.some(member => member._id.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول إلى هذا المشروع'
      });
    }
    
    // جلب المهام المرتبطة بالمشروع
    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      project: {
        ...project.toObject(),
        tasks
      }
    });
  } catch (error) {
    console.error('خطأ في جلب المشروع:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب المشروع'
    });
  }
});

// تحديث مشروع
router.patch('/:id', checkRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { name, description, status, startDate, endDate, team } = req.body;
    const projectId = req.params.id;
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'المشروع غير موجود'
      });
    }
    
    if (name) project.name = name;
    if (description) project.description = description;
    if (status) project.status = status;
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;
    if (team) project.team = team;
    
    await project.save();
    
    res.json({
      success: true,
      message: 'تم تحديث المشروع بنجاح',
      project
    });
  } catch (error) {
    console.error('خطأ في تحديث المشروع:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث المشروع'
    });
  }
});

// حذف مشروع
router.delete('/:id', checkRole(['admin', 'teacher']), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'المشروع غير موجود'
      });
    }
    
    // حذف المهام المرتبطة بالمشروع
    await Task.deleteMany({ project: project._id });
    
    // حذف المشروع
    await project.remove();
    
    res.json({
      success: true,
      message: 'تم حذف المشروع والمهام المرتبطة به بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حذف المشروع:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف المشروع'
    });
  }
});

// إضافة أعضاء إلى المشروع
router.post('/:id/team', checkRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { members } = req.body;
    const projectId = req.params.id;
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'المشروع غير موجود'
      });
    }
    
    // إضافة الأعضاء الجدد (مع تجنب التكرار)
    const currentTeamIds = project.team.map(id => id.toString());
    const newMembers = members.filter(id => !currentTeamIds.includes(id));
    
    project.team = [...project.team, ...newMembers];
    
    await project.save();
    
    res.json({
      success: true,
      message: 'تم إضافة الأعضاء بنجاح',
      project
    });
  } catch (error) {
    console.error('خطأ في إضافة أعضاء:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إضافة الأعضاء'
    });
  }
});

// إزالة عضو من المشروع
router.delete('/:id/team/:userId', checkRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'المشروع غير موجود'
      });
    }
    
    // إزالة العضو من الفريق
    project.team = project.team.filter(memberId => memberId.toString() !== userId);
    
    await project.save();
    
    res.json({
      success: true,
      message: 'تم إزالة العضو بنجاح',
      project
    });
  } catch (error) {
    console.error('خطأ في إزالة عضو:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إزالة العضو'
    });
  }
});

module.exports = router;
