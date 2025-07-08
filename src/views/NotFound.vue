<template>
	<v-container class="fill-height" role="main">
		<v-row align="center" justify="center">
			<v-col cols="12" sm="8" md="6" class="text-center">
				<section>
					<h1 class="text-h1 font-weight-bold mb-4">
						{{ $t("notFoundTitle") }}
					</h1>
					<h2 class="text-h4 mb-6">{{ $t("notFoundPageNotFound") }}</h2>
					<p class="text-body-1 mb-8">
						{{ $t("notFoundMessage") }}
					</p>
					<v-btn color="primary" size="large" to="/" class="text-none">{{
						$t("notFoundGoHome")
					}}</v-btn>
				</section>
			</v-col>
		</v-row>
	</v-container>
</template>
