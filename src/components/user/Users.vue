<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <div style="margin-top: 15px;">
        <el-row :gutter="20">
          <el-col :span="7">
            <el-input
              placeholder="请输入内容"
              v-model="queryInfo.query"
              clearable
              @clear="getUserList"
            >
              <el-button
                slot="append"
                icon="el-icon-search"
                @click="getUserList"
              ></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button
              type="primary"
              @click="addDialogVisible = true"
            >添加用户</el-button>
          </el-col>
        </el-row>
      </div>
      <!-- 用户表格 -->
      <el-table
        border
        stripe
        :data="userList"
        style="width: 100%"
      >
        <el-table-column type="index">
        </el-table-column>
        <el-table-column
          prop="username"
          label="姓名"
          width="180"
        >
        </el-table-column>
        <el-table-column
          prop="email"
          label="邮箱"
          width="180"
        >
        </el-table-column>
        <el-table-column
          prop="mobile"
          label="电话"
        >
        </el-table-column>
        <el-table-column
          prop="role_name"
          label="角色"
        >
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              @change="userStateChange(scope.row)"
              v-model="scope.row.mg_state"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="300"
        >
          <template slot-scope="scope">

            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editButton(scope.row)"
            >编辑</el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUser(scope.row.id)"
            >删除</el-button>
            <!-- 分配角色按钮 -->
            <!-- 文字提示 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                size="mini"
                icon="el-icon-setting"
                @click="openRoleDialogVisible(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="pageSizes"
        :page-size="queryInfo.pagesize"
        :layout="layout"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      @close="cancel"
      :visible.sync="addDialogVisible"
      width="50%"
    >
      <!-- 对话框内容主题区 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item
          label="用户名"
          prop="username"
        >
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item
          label="密码"
          prop="password"
        >
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item
          label="邮箱"
          prop="email"
        >
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item
          label="电话"
          prop="mobile"
        >
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="cancel">取 消</el-button>
        <el-button
          type="primary"
          @click="addUser"
        >确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改用户信息"
      @close="editCancel"
      :visible.sync="editDialogVisible"
      width="50%"
    >
      <!-- 对话框内容主题区 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item
          prop="username"
          label="用户名"
        >
          <el-input
            v-model="editForm.username"
            :disabled="true"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="邮箱"
          prop="email"
        >
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item
          label="电话"
          prop="mobile"
        >
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="editCancel">取 消</el-button>
        <el-button
          type="primary"
          @click="editUser"
        >确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
    >
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>分配新角色：
          <template>
            <el-select
              v-model="selectRoleId"
              placeholder="请选择"
            >
              <el-option
                v-for="item in roleList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </template>
        </p>
      </div>
      <!-- 底部区域 -->
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="closeRoleDialog">取 消</el-button>
        <el-button
          type="primary"
          @click="addUserRole"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    // 验证邮箱的验证规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 验证手机号的验证规则
    var checkMobil = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号码'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      total: 0,
      layout: 'total, sizes, prev, pager, next, jumper',
      pageSizes: [1, 2, 5, 10],
      userList: [],
      // 控制添加用户对话框的显示和隐藏
      addDialogVisible: false,
      // 控制修改用户对话框的显示和隐藏
      editDialogVisible: false,
      // 控制分配角色弹窗的弹出和关闭
      setRoleDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 修改用户的表单数据
      editForm: {
        id: '',
        username: '',
        role_id: '',
        mobile: '',
        email: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户姓名', trigger: 'blur' },
          { min: 3, max: 6, message: '用户名的长度限制在3~6个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码的长度限制在6~15个字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkMobil, trigger: 'blur' }
        ]
      },
      editFormRules: {
        username: [
          { required: false, message: '请输入用户姓名', trigger: 'blur' },
          { min: 3, max: 6, message: '用户名的长度限制在3~6个字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkMobil, trigger: 'blur' }
        ]
      },
      // 需要被分配角色的用户信息
      userInfo: {},
      // 角色权限列表
      roleList: [],
      // 已选中的角色权限ID
      selectRoleId: ''
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const that = this
      const { data: res } = await that.$http.get('/users', { params: that.queryInfo })
      if (res.meta.status !== 200) return that.$message.error(res.meta.msg)
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听pageSize改变的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 修改当前用户状态
    async userStateChange (userInfo) {
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
    },
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addForm)
        this.$refs.addFormRef.resetFields()
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getUserList()
        this.addDialogVisible = !this.addDialogVisible
      })
    },
    // 添加用户表单关闭
    cancel () {
      // 重置表单
      this.$refs.addFormRef.resetFields()
      this.addDialogVisible = false
    },
    // 修改按钮事件
    async editButton (row) {
      const { data: res } = await this.$http.get('users/' + row.id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 修改用户按钮关闭
    editCancel () {
      this.$refs.editFormRef.resetFields()
      this.editDialogVisible = false
    },
    // 修改用户
    editUser () {
      const editForm = this.editForm
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('users/' + editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.editDialogVisible = false
        this.$message.success(res.meta.msg)
        this.getUserList()
      })
    },
    // 删除用户按钮
    async deleteUser (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(res => res)
      if (confirmResult === 'confirm') {
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.queryInfo.pagenum = 1
        this.getUserList()
      } else {
        this.$message.info('已取消删除用户操作！')
      }
    },
    // 分配角色的按钮
    async openRoleDialogVisible (userInfo) {
      this.userInfo = userInfo
      // 在展示对话框之前，获取所有角色的列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.roleList = res.data
      this.setRoleDialogVisible = true
    },
    // 关闭分配角色的弹窗
    closeRoleDialog () {
      this.setRoleDialogVisible = false
      this.selectRoleId = ''
      this.userInfo = []
    },
    // 增加用户分配角色
    async addUserRole () {
      if (!this.selectRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectRoleId
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.setRoleDialogVisible = false
      this.getUserList()
    }

  }
}
</script>

<style lang="less" scoped>
</style>
