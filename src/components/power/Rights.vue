<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card class="box-card">
      <!-- 权限表格 -->
      <el-table
        border
        stripe
        :data="rightsList"
        style="width: 100%"
      >
        <el-table-column type="index">
        </el-table-column>
        <el-table-column
          prop="authName"
          label="权限名称"
          width="180"
        >
        </el-table-column>
        <el-table-column
          prop="path"
          label="路径"
          width="180"
        >
        </el-table-column>
        <el-table-column
          prop="level"
          label="权限等级"
          width="180"
        >
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level=='0'">一级</el-tag>
            <el-tag
              v-if="scope.row.level=='1'"
              type="success"
            >二级</el-tag>
            <el-tag
              v-if="scope.row.level=='2'"
              type="warning"
            >三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      rightsList: []
    }
  },
  created () {
    this.getRightsList()
  },
  methods: {
    // 获取权限列表的数据
    async getRightsList () {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rightsList = res.data
    }
  }
}
</script>
<style lang="less" scoped>
</style>
