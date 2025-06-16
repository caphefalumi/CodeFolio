<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-title>
        <router-link to="/" class="text-decoration-none text-white">
          CodeFolio
        </router-link>
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn to="/" text>Home</v-btn>
      <v-btn to="/projects" text>Projects</v-btn>
      <v-btn to="/login" text>Login</v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-main>

    <v-footer app color="primary" dark>
      <v-row justify="center" no-gutters>
        <v-col class="text-center" cols="12">
          {{ new Date().getFullYear() }} — <strong>CodeFolio</strong>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<style>
#app {
  font-family: 'Roboto', sans-serif
}
</style>
