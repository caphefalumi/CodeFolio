<template>
  <div>
    <v-container>
      <!-- Search and Filter Section -->
      <section>
        <v-row class="mb-6">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="search"
              label="Search projects"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedType"
              :items="projectTypes"
              item-title="title"
              item-value="value"
              label="Project Type"
              variant="outlined"
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="sortBy"
              :items="sortOptions"
              item-title="title"
              item-value="value"
              label="Sort By"
              variant="outlined"
              hide-details
            ></v-select>
          </v-col>
        </v-row>
      </section>
      <!-- Projects Grid -->
      <section>
        <v-row v-auto-animate>
          <v-col
            v-for="project in paginatedProjects"
            :key="project._id"
            cols="12"
            md="4"
          >
            <article>
              <project-card
                :project="project"
                :show-edit-button="false"
                :show-delete-button="false"
                :show-like-button="true"
                @view="viewProject"
                @like="toggleLike"
              />
            </article>
          </v-col>
        </v-row>
      </section>
      <!-- Pagination -->
      <section>
        <v-row class="mt-6">
          <v-col cols="12" class="text-center">
            <v-pagination
              v-model="page"
              :length="totalPages"
              rounded
            ></v-pagination>
          </v-col>
        </v-row>
      </section>
      <app-alert
        v-if="errorMessage"
        type="error"
        :message="errorMessage"
        custom-class="mb-4"
      />
    </v-container>
  </div>
</template>

<script>
import axios from "axios";
import AppAlert from "@/components/AppAlert.vue";
import ProjectCard from "@/components/ProjectCard.vue";
import { useApi } from "@/composables/common.js";

export default {
  name: "ProjectsView",
  components: {
    AppAlert,
    ProjectCard,
  },
  setup() {
    const { handleError } = useApi();
    return { handleError };
  },
  data() {
    return {
      projects: [],
      search: "",
      selectedType: "all",
      sortBy: "newest",
      page: 1,
      itemsPerPage: 6,
      projectTypes: [
        { title: "All Types", value: "all" },
        { title: "Web App", value: "web" },
        { title: "Mobile App", value: "mobile" },
        { title: "Game", value: "game" },
        { title: "Design", value: "design" },
      ],
      sortOptions: [
        { title: "Newest First", value: "newest" },
        { title: "Most Liked", value: "liked" },
        { title: "Most Viewed", value: "viewed" },
      ],
      errorMessage: "",
    };
  },
  computed: {
    filteredProjects() {
      let filtered = this.projects;
      if (this.selectedType !== "all") {
        filtered = filtered.filter(
          (project) => project.type === this.selectedType,
        );
      }
      if (this.search) {
        // If search starts with #, filter by tag
        if (this.search.startsWith("#")) {
          const tagQuery = this.search.slice(1).toLowerCase();
          filtered = filtered.filter(
            (project) =>
              Array.isArray(project.tags) &&
              project.tags.some((tag) => tag.toLowerCase().includes(tagQuery)),
          );
        } else {
          filtered = filtered.filter(
            (project) =>
              project.title.toLowerCase().includes(this.search.toLowerCase()) ||
              project.description
                ?.toLowerCase()
                .includes(this.search.toLowerCase()),
          );
        }
      }
      if (this.sortBy === "newest") {
        filtered = filtered.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
      } else if (this.sortBy === "liked") {
        filtered = filtered.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
      } else if (this.sortBy === "viewed") {
        filtered = filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
      }
      return filtered;
    },
    totalPages() {
      return Math.ceil(this.filteredProjects.length / this.itemsPerPage);
    },
    paginatedProjects() {
      const start = (this.page - 1) * this.itemsPerPage;
      return this.filteredProjects.slice(start, start + this.itemsPerPage);
    },
  },
  methods: {
    viewProject(project) {
      this.$router.push(
        `/${project.author?.username || "unknown"}/${project._id}`,
      );
    },

    async toggleLike(project) {
      try {
        if (!project.liked) {
          const res = await axios.post(`https://server-codefolio.vercel.app/api/posts/${project._id}/upvote`);
          project.upvotes = res.data.upvotes;
          project.liked = true;
        } else {
          const res = await axios.post(`https://server-codefolio.vercel.app/api/posts/${project._id}/downvote`);
          project.downvotes = res.data.downvotes;
          project.liked = false;
        }
      } catch (error) {
        this.errorMessage = this.handleError(
          error,
          "Failed to update vote. Please try again.",
        );
      }
    },
  },
  async mounted() {
    try {
      const response = await axios.get("https://server-codefolio.vercel.app/api/posts/");
      this.projects = response.data;
      console.log("Projects:", this.projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  },
};
</script>
