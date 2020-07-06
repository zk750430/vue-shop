<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <div style="margin-top: 15px;">
        <el-row :gutter="20">
          <el-col :span="4">
            <el-button
              @click="openCateDialog"
              type="primary"
            >添加分类</el-button>
          </el-col>
        </el-row>
      </div>
      <!-- 用户表格 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text=""
        border
      >
        <!-- 是否有效 -->
        <template
          slot-scope="scoped"
          slot="isOk"
        >
          <i
            v-if="scoped.row.cat_deleted === false"
            class="el-icon-success"
            style="color: lightgreen;"
          ></i>
          <i
            v-if="scoped.row.cat_deleted === true"
            class="el-icon-error"
            style="color: red;"
          ></i>
        </template>
        <!-- 排序 -->
        <template
          slot="sort"
          slot-scope="scoped"
        >
          <el-tag v-if="scoped.row.cat_level==0">一级</el-tag>
          <el-tag
            type="success"
            v-if="scoped.row.cat_level==1"
          >二级</el-tag>
          <el-tag
            type="warning"
            v-if="scoped.row.cat_level==2"
          >三级</el-tag>
        </template>
        <template
          slot="operation"
          slot-scope="scope"
        >
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
        </template>
      </tree-table>
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
    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="closeCateDialogVisible"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateRules"
        ref="addCateRef"
        label-width="100px"
      >
        <el-form-item
          label="分类名称："
          prop="cat_name"
        >
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-cascader
            :options="parentCateList"
            :props="cascaderProps"
            v-model="selectKeys"
            @change="parentCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="closeCateDialogVisible">取 消</el-button>
        <el-button
          type="primary"
          @click="addCate"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      cateList: [],
      pageSizes: [10, 20, 50, 100],
      // 获取商品分类列表的参数对象
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      // 分页展示的数据，以及排序方式
      layout: 'total, sizes, prev, pager, next, jumper',
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
          width: '400px'
        },
        {
          label: '是否有效',
          // 将当前列指定为模板列
          type: 'template',
          template: 'isOk'
        },
        {
          label: '排序',
          // 将当前列指定为模板列
          type: 'template',
          template: 'sort'
        },
        {
          label: '操作',
          // 将当前列指定为模板列
          type: 'template',
          template: 'operation'
        }
      ],
      // 控制添加分类对话框的显示和隐藏
      addCateDialogVisible: false,
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        // 分类的等级默认为一级
        cat_level: 0
      },
      addCateRules: {
        cat_name: [{
          required: true, message: '请输入分类名称', tigger: 'blur'
        }]
      },
      // 父级分类列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true,
        expandTrigger: 'click'
      },
      // 选中的父级分类的数组
      selectKeys: []
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听pageSize改变的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听页码值改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    openCateDialog () {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    closeCateDialogVisible () {
      this.addCateDialogVisible = false
      this.selectKeys = []
      this.$refs.addCateRef.resetFields()
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 获取父级分类列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数值
    parentCateChanged () {
      if (this.selectKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectKeys[this.selectKeys.length - 1]
        this.addCateForm.cat_level = this.selectKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    async addCate () {
      this.$refs.addCateRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.addCateDialogVisible = false
        this.getCateList()
        this.$message.success(res.meta.msg)
      })
    }
  }
}
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
