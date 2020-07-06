<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <div style="margin-top: 5px;">
        <el-row :gutter="12">
          <el-col :span="4">
            <el-button
              type="primary"
              @click="roleDialogOpen"
            >添加角色</el-button>
          </el-col>
        </el-row>
      </div>
      <!-- 权限表格 -->
      <el-table
        border
        stripe
        :data="rolesList"
        style="width: 100%"
      >
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['vcenter','bdbottom',i1 === 0 ? 'bdtop' : '']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="deleteRight(scope.row,item1.id)"
                >{{ item1.authName }}</el-tag>
                <el-icon
                  name="yiji"
                  class="el-icon-caret-right"
                ></el-icon>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                  :class="['vcenter',i2===0?'':'bdtop']"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      @close="deleteRight(scope.row,item2.id)"
                      type="success"
                    >{{ item2.authName }}</el-tag>
                    <el-icon
                      name="erji"
                      class="el-icon-caret-right"
                    ></el-icon>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      closable
                      type="warning"
                      @close="deleteRight(scope.row,item3.id)"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index">
        </el-table-column>
        <el-table-column
          prop="roleName"
          label="角色名称"
          width="180"
        >
        </el-table-column>
        <el-table-column
          prop="roleDesc"
          label="角色描述"
          width="180"
        >
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editRoleDialogOpen(scope.row.id)"
            >编辑</el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRole(scope.row.id)"
            >删除</el-button>
            <!-- 分配角色按钮 -->
            <!-- 文字提示 -->
            <el-button
              type="warning"
              size="mini"
              icon="el-icon-setting"
              @click="openSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色弹框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="roleDialogVisible"
      width="50%"
      @close="roleDialogClose"
    >
      <el-form
        :model="roleForm"
        :rules="roleFormRules"
        ref="roleFormRef"
        label-width="120px"
      >
        <el-form-item
          prop="roleName"
          label="角色名称"
        >
          <el-input v-model="roleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item
          prop="roleDesc"
          label="角色描述"
        >
          <el-input v-model="roleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="roleDialogClose">取 消</el-button>
        <el-button
          type="primary"
          @click="addRole"
        >确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="添加角色"
      :visible.sync="roleDialogVisible"
      width="50%"
      @close="roleDialogClose"
    >
      <el-form
        :model="roleForm"
        :rules="roleFormRules"
        ref="roleFormRef"
        label-width="120px"
      >
        <el-form-item
          prop="roleName"
          label="角色名称"
        >
          <el-input v-model="roleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item
          prop="roleDesc"
          label="角色描述"
        >
          <el-input v-model="roleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="roleDialogClose">取 消</el-button>
        <el-button
          type="primary"
          @click="addRole"
        >确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色弹窗 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editRoleDialogVisible"
      width="50%"
      @close="editRoleDialogClose"
    >
      <el-form
        :model="editRoleForm"
        :rules="editRoleFormRules"
        ref="editRoleFormRef"
        label-width="120px"
      >
        <el-form-item
          prop="roleName"
          label="角色名称"
        >
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item
          prop="roleDesc"
          label="角色描述"
        >
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="editRoleDialogClose">取 消</el-button>
        <el-button
          type="primary"
          @click="saveEditRole"
        >确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限弹窗 -->
    <el-dialog
      title="分配权限"
      :visible.sync="showSetRightDialog"
      width="50%"
      @close="closeSetRightDialog"
    >
      <!--树形控件 -->
      <el-tree
        :data="rightTree"
        show-checkbox
        :default-expand-all="true"
        :default-checked-keys="defKeys"
        node-key="id"
        :props="treeProps"
        ref="treeRef"
      >
      </el-tree>
      <!-- 底部 -->
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="closeSetRightDialog">取 消</el-button>
        <el-button
          type="primary"
          @click="allotRights"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      rolesList: [],
      // 增加角色弹窗控制字段
      roleDialogVisible: false,
      // 修改角色弹窗控制字段
      editRoleDialogVisible: false,
      // 增加角色表单实体
      roleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 增加角色验证规则
      roleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 6, message: '角色名称的长度限制在3~6个字符之间', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 3, max: 20, message: '角色描述的长度限制在3~20个字符之间', trigger: 'blur' }
        ]
      },
      // 编辑角色验证规则
      editRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 6, message: '角色名称的长度限制在3~6个字符之间', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 3, max: 20, message: '角色描述的长度限制在3~20个字符之间', trigger: 'blur' }
        ]
      },
      // 编辑角色表单实体
      editRoleForm: {
        roleId: '',
        roleName: '',
        roleDesc: ''
      },
      // 分配权限弹窗控制字段
      showSetRightDialog: false,
      // 所有权限
      rightTree: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的数组
      defKeys: [],
      roleId: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg)
      } else {
        this.rolesList = res.data
      }
    },
    // 添加角色
    addRole () {
      this.$refs.roleFormRef.validate(async valid => {
        if (!valid) return
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('roles', this.roleForm)
        this.$refs.roleFormRef.resetFields()
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getRolesList()
        this.roleDialogVisible = !this.roleDialogVisible
      })
    },
    // 添加角色弹窗的弹出
    roleDialogOpen () {
      this.roleDialogVisible = !this.roleDialogVisible
    },
    // 关闭角色弹窗
    roleDialogClose () {
      this.$refs.roleFormRef.resetFields()
      this.roleDialogVisible = false
    },
    // 修改角色弹窗弹出以及获取角色信息
    async editRoleDialogOpen (id) {
      this.editRoleDialogVisible = true
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editRoleForm = res.data
    },
    // 关闭编辑角色弹窗
    editRoleDialogClose () {
      this.$refs.editRoleFormRef.resetFields()
      this.editRoleDialogVisible = false
    },
    // 角色修改的提交
    saveEditRole () {
      const editRoleForm = this.editRoleForm
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('roles/' + editRoleForm.roleId, {
          roleName: editRoleForm.roleName,
          roleDesc: editRoleForm.roleDesc
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$refs.editRoleFormRef.resetFields()
        this.$message.success(res.meta.msg)
        this.editRoleDialogVisible = false
        this.getRolesList()
      })
    },
    // 删除角色
    async deleteRole (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(res => res)
      if (confirmResult === 'confirm') {
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getRolesList()
      } else {
        this.$message.info('已取消删除该角色操作！')
      }
    },
    // 删除角色指定权限
    async deleteRight (role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(res => res)
      if (confirmResult === 'confirm') {
        const { data: res } = await this.$http.delete('roles/' + role.id + '/rights/' + rightId)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        // 为了防止每次删除指定权限后刷新真个列表采用此方式
        role.children = res.data
        // this.getRolesList()
      } else {
        this.$message.info('已取消删除该权限操作！')
      }
    },
    // 分配权限弹窗弹出
    async openSetRightDialog (role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rightTree = res.data
      // 递归获取三级节点的ID
      this.getLeafKeys(role, this.defKeys)
      this.showSetRightDialog = true
    },
    // 分配权限弹窗关闭
    closeSetRightDialog () {
      this.defKeys = []
      this.showSetRightDialog = false
    },
    // 通过递归的形式，获取角色下所有三级权限的id,并保存到defKeys
    getLeafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 点击为角色分配权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.showSetRightDialog = false
      this.getRolesList()
      this.$message.success(res.meta.msg)
    }
  }

}
</script>
<style lang="less" scoped>
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.el-tag {
  margin: 7px;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
