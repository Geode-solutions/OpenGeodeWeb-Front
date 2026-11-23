// oxlint-disable import/max-dependencies -- one icon import per geode object type
import type { GeodeObjectType } from "@geode/opengeodeweb-microservice/data_types";

import BRep from "@ogw_front/assets/img/geode_objects/BRep.svg";
import CrossSection from "@ogw_front/assets/img/geode_objects/CrossSection.svg";
import EdgedCurve2D from "@ogw_front/assets/img/geode_objects/EdgedCurve2D.svg";
import EdgedCurve3D from "@ogw_front/assets/img/geode_objects/EdgedCurve3D.svg";
import Graph from "@ogw_front/assets/img/geode_objects/Graph.svg";
import HorizonStack3D from "@ogw_front/assets/img/geode_objects/HorizonStack3D.svg";
import HybridSolid3D from "@ogw_front/assets/img/geode_objects/HybridSolid3D.svg";
import ImplicitCrossSection from "@ogw_front/assets/img/geode_objects/ImplicitCrossSection.svg";
import ImplicitStructuralModel from "@ogw_front/assets/img/geode_objects/ImplicitStructuralModel.svg";
import LightRegularGrid2D from "@ogw_front/assets/img/geode_objects/LightRegularGrid2D.svg";
import LightRegularGrid3D from "@ogw_front/assets/img/geode_objects/LightRegularGrid3D.svg";
import PointSet2D from "@ogw_front/assets/img/geode_objects/PointSet2D.svg";
import PointSet3D from "@ogw_front/assets/img/geode_objects/PointSet3D.svg";
import PolygonalSurface2D from "@ogw_front/assets/img/geode_objects/PolygonalSurface2D.svg";
import PolygonalSurface3D from "@ogw_front/assets/img/geode_objects/PolygonalSurface3D.svg";
import PolyhedralSolid3D from "@ogw_front/assets/img/geode_objects/PolyhedralSolid3D.svg";
import RasterImage2D from "@ogw_front/assets/img/geode_objects/RasterImage2D.svg";
import RasterImage3D from "@ogw_front/assets/img/geode_objects/RasterImage3D.svg";
import RegularGrid2D from "@ogw_front/assets/img/geode_objects/RegularGrid2D.svg";
import RegularGrid3D from "@ogw_front/assets/img/geode_objects/RegularGrid3D.svg";
import Section from "@ogw_front/assets/img/geode_objects/Section.svg";
import StructuralModel from "@ogw_front/assets/img/geode_objects/StructuralModel.svg";
import TetrahedralSolid3D from "@ogw_front/assets/img/geode_objects/TetrahedralSolid3D.svg";
import TriangulatedSurface2D from "@ogw_front/assets/img/geode_objects/TriangulatedSurface2D.svg";
import TriangulatedSurface3D from "@ogw_front/assets/img/geode_objects/TriangulatedSurface3D.svg";
import VertexSet from "@ogw_front/assets/img/geode_objects/VertexSet.svg";

// Icon of each geode object type: every type of data_types.py must have one
const geodeObjectImages: Record<GeodeObjectType, string> = {
  BRep,
  CrossSection,
  EdgedCurve2D,
  EdgedCurve3D,
  Graph,
  HorizonStack3D,
  HybridSolid3D,
  ImplicitCrossSection,
  ImplicitStructuralModel,
  LightRegularGrid2D,
  LightRegularGrid3D,
  PointSet2D,
  PointSet3D,
  PolygonalSurface2D,
  PolygonalSurface3D,
  PolyhedralSolid3D,
  RasterImage2D,
  RasterImage3D,
  RegularGrid2D,
  RegularGrid3D,
  Section,
  StructuralModel,
  TetrahedralSolid3D,
  TriangulatedSurface2D,
  TriangulatedSurface3D,
  VertexSet,
};

function geodeObjectImage(geodeObjectType: GeodeObjectType): string {
  return geodeObjectImages[geodeObjectType];
}

export { geodeObjectImage };
