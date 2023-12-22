<template>
  <v-row justify="center">
    <v-col cols="12" class="ma-3">
      <v-card loading>
        <v-card-title class="text-center">
          Cloud instance is starting...
        </v-card-title>
        <v-card-subtitle class="text-center">
          Why do you have to wait?
        </v-card-subtitle>
        <v-card-text class="text-center">
          We start our server only on demand... and this takes a few minutes
          before you can use our free app.
          <br />
          This is aligned with our energy sobriety policy. So be patient
          <v-icon color="primary" size="20">
            mdi-emoticon-excited-outline
          </v-icon>
          <br />
          <Carousel :items="users_list"/>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>


<script setup>
  import { useDisplay } from "vuetify"
  import ying_yang from "@/assets/img/logos/ying yang.png"
  import chemin from "@/assets/img/logos/chemin.png"
  import vert from "@/assets/img/logos/vert.png"
  import lampadaire from "@/assets/img/logos/lampadaire.png"
  import collegue from "@/assets/img/logos/collegue.png"
  import sobene from "@/assets/img/logos/sobene.png"
  import etincelle from "@/assets/img/logos/etincelle.png"
  import geste from "@/assets/img/logos/geste.png"
  import socle from "@/assets/img/logos/socle.png"
  import derniere from "@/assets/img/logos/derniere.png"
  import salon from "@/assets/img/logos/salon.png"



  import { loadFull } from "tsparticles"

  const particlesInit = async (engine) => {
    await loadFull(engine)
  }

  useHead({
    titleTemplate: "OpenGeode - open source framework for geometric models",
  })

  const users_list = [
    {
      name: "YING YANG",
      logo: ying_yang,
      // url: "https://www.nrcan.gc.ca/home",
    },
    {
      name: "CHEMIN",
      logo: chemin,
      // url: "https://www.ring-team.org",
    },
    {
      name: "SOBRIETE ENERGETIQUE",
      logo: sobene,
      // url: "https://www.ring-team.org",
    },
    {
      name: "VERT",
      logo: vert,
      // url: "https://www.nrcan.gc.ca/home",
    },
    {
      name: "LAMPADAIRE",
      logo: lampadaire,
      // url: "https://www.bsc.es/",
    },
    {
      name: "COLLEGUE",
      logo: collegue,
      // url: "https://www.bsc.es/",
    },
    {
      name: "ETINCELLE",
      logo: etincelle,
      // url: "https://www.nrcan.gc.ca/home",
    },
    {
      name: "GESTE",
      logo: geste,
      // url: "https://www.nrcan.gc.ca/home",
    },
    {
      name: "SOCLE",
      logo: socle,
      // url: "https://www.nrcan.gc.ca/home",
    },
    {
      name: "DERNIERE",
      logo: derniere,
      // url: "https://www.nrcan.gc.ca/home",
    },
    {
      name: "SALON",
      logo: salon,
      // url: "https://www.nrcan.gc.ca/home",
    },
  ]

  const { smAndUp } = useDisplay()
</script>