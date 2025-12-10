<template>
  <v-row justify="center">
    <v-col cols="12" class="ma-3">
      <v-card loading>
        <v-card-title class="text-center">
          Microservices are starting...
        </v-card-title>
        <v-card-subtitle class="text-center">
          Why do you have to wait?
        </v-card-subtitle>
        <v-card-text class="text-center">
          We start our microservices only on demand... and this takes a few
          minutes before you can use our free app.
          <br />
          This is aligned with our energy sobriety policy. So be patient
          <v-icon color="primary" size="20">
            mdi-emoticon-excited-outline
          </v-icon>
          <br />
          <Carousel :items="users_list" />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
  import ying_yang from "@ogw_front/assets/img/energy_sobriety/ying_yang.png"
  import chemin from "@ogw_front/assets/img/energy_sobriety/chemin.png"
  import vert from "@ogw_front/assets/img/energy_sobriety/vert.png"
  import lampadaire from "@ogw_front/assets/img/energy_sobriety/lampadaire.png"
  import collegue from "@ogw_front/assets/img/energy_sobriety/collegue.png"
  import sobene from "@ogw_front/assets/img/energy_sobriety/sobene.png"
  import etincelle from "@ogw_front/assets/img/energy_sobriety/etincelle.png"
  import geste from "@ogw_front/assets/img/energy_sobriety/geste.png"
  import socle from "@ogw_front/assets/img/energy_sobriety/socle.png"
  import derniere from "@ogw_front/assets/img/energy_sobriety/derniere.png"
  import salon from "@ogw_front/assets/img/energy_sobriety/salon.png"

  import Carousel from "@ogw_front/components/Carousel"

  const users_list = [
    {
      name: "YING YANG",
      logo: ying_yang,
    },
    {
      name: "CHEMIN",
      logo: chemin,
    },
    {
      name: "SOBRIETE ENERGETIQUE",
      logo: sobene,
    },
    {
      name: "VERT",
      logo: vert,
    },
    {
      name: "LAMPADAIRE",
      logo: lampadaire,
    },
    {
      name: "COLLEGUE",
      logo: collegue,
    },
    {
      name: "ETINCELLE",
      logo: etincelle,
    },
    {
      name: "GESTE",
      logo: geste,
    },
    {
      name: "SOCLE",
      logo: socle,
    },
    {
      name: "DERNIERE",
      logo: derniere,
    },
    {
      name: "SALON",
      logo: salon,
    },
  ]
</script>
