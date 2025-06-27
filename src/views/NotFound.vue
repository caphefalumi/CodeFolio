<template>
  <v-container class="fill-height" role="main" aria-labelledby="error-heading">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" class="text-center">
        <section aria-describedby="error-description">
          <h1 id="error-heading" class="text-h1 font-weight-bold mb-4">404</h1>
          <h2 class="text-h4 mb-6">Page Not Found</h2>
          <p id="error-description" class="text-body-1 mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <nav aria-label="Return navigation">
            <v-btn
              color="primary"
              size="large"
              to="/"
              class="text-none"
              aria-label="Return to home page"
              role="button"
            >
              Go Home
            </v-btn>
          </nav>
        </section>
      </v-col>
    </v-row>
  </v-container>
</template>