<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <!-- 警告标签 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            :options="cateList"
            :props="cateProps"
            v-model="selectedCateKeys"
            @change="cateChanged"
            clearable
            style="width:350px;"
          ></el-cascader>
        </el-col>
      </el-row>
      <el-tabs
        v-model="activeName"
        @tab-click="handleTabClick"
        type="card"
      >
        <el-tab-pane
          label="动态参数"
          name="many"
        >
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="openDialog"
          >添加参数</el-button>
          <!--  动态参数表格-->
          <el-table
            :data="manyTableData"
            border
            stripe
          >
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,index) in scope.row.attr_vals"
                  :key="index"
                  closable
                >{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- 修改按钮 -->
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <!-- 删除按钮 -->
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane
          label="静态属性"
          name="only"
        >
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="openDialog"
          >添加属性</el-button>
          <!--  静态属性表格-->
          <el-table
            :data="onlyTableData"
            border
            stripe
          >
            <!-- 展开列 -->
            <el-table-column type="expand"></el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- 修改按钮 -->
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <!-- 删除按钮 -->
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 新增弹窗 -->
    <el-dialog
      :title="`添加`+titelText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="closeDialog"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item
          :label="titelText"
          prop="attr_name"
        >
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="addParams"
        >确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改弹窗 -->
    <el-dialog
      :title="`修改`+titelText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="closeEditDialog"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item
          :label="titelText"
          prop="attr_name"
        >
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="editParams"
        >确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>
<script>
export default {
  data () {
    return {
      // 商品分类列表
      cateList: [],
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 选中的商品分类的数组
      selectedCateKeys: [],
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],
      addDialogVisible: false,
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ]
      },
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 6个字符', trigger: 'blur' }
        ]
      },
      editForm: {
        attr_id: '',
        attr_name: '',
        cat_id: '',
        attr_sel: '',
        attr_write: '',
        attr_vals: ''
      },
      editDialogVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getParamsList () {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel: this.activeName
        }
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示和隐藏
        item.inputVisible = false
        item.inputValue = ''
      })
      console.log(res.data)
    },
    // 获取所有的商品分类列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.cateList = res.data
    },
    // 级联选择器变化事件
    async cateChanged () {
      this.getParamsList()
    },
    // tab变化管理
    async handleTabClick () {
      if (this.cateId !== null) {
        this.getParamsList()
      }
    },
    openDialog () {
      this.addDialogVisible = true
    },
    closeDialog () {
      this.$refs.addFormRef.resetFields()
      this.addDialogVisible = false
    },
    // addParams
    async addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.addDialogVisible = true
        this.getParamsList()
        this.$message.success(res.meta.msg)
      })
    },
    async showEditDialog (attrId) {
      this.editDialogVisible = true
      console.log(attrId + '--------' + this.cateId)
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/` + attrId,
        { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editForm = res.data
      console.log(res.data)
    },
    closeEditDialog () {
      this.$refs.editFormRef.resetFields()
      this.editDialogVisible = false
    },
    editParams (attrId) {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.editForm.cat_id}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.editForm.attr_sel,
          attr_vals: this.editForm.attr_vals
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getParamsList()
        this.editDialogVisible = false
      })
    },
    async deleteParams (attrid) {
      const confirmResult = await this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(res => res)
      if (confirmResult === 'confirm') {
        const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/` + attrid)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getParamsList()
      } else {
        this.$message.info('已取消删除操作！')
      }
    },
    // 动态标签展示输入框
    showInput (row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
      console.log(row)
    },
    // 动态标签关闭输入框
    handleInputConfirm (row) {
      // row.inputVisible = false
      // row.inputValue = ''
    }
  },
  // 计算属性
  computed: {
    // 如果按钮需要被禁用，则返回true,否则返回false
    isBtnDisabled () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态计算标题的文本
    titelText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 15px 0px;
}
.el-tag {
  margin-right: 10px;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
