<template>
  <div class="about-us">
    <v-container>
      <v-row>
        <v-col cols="12">
          <h1 class="page-title">About Us</h1>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-card class="section-card" v-for="(section, index) in sections" :key="index">
            <v-card-title class="section-title">{{ section.title }}</v-card-title>
            <v-card-text class="section-content">{{ section.content }}</v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

