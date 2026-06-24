UPDATE public.products
SET
  description = $$Polera Heavy Cotton de 170 g confeccionada en algodón 100% fibra natural. Su estructura tubular ayuda a mantener la forma de la prenda y entrega un calce firme, con refuerzo de hombro a hombro para mayor resistencia en uso diario o corporativo. Incorpora tratamiento antipilling, estabilidad dimensional, solidez de color y protección UPF+, manteniendo suavidad, color y aspecto impecable lavado tras lavado.$$,
  extract = $$Algodón 100%, estructura tubular y tratamiento antipilling para uso corporativo diario.$$,
  composition = $$100% algodón$$,
  weight = $$170 g$$,
  technologies = ARRAY['Antipilling', 'Estabilidad dimensional', 'Solidez de color por luz', 'Proteccion UPF+'],
  sizes = ARRAY['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']
WHERE slug IN ('heavy-cotton-mc', 's-n');

UPDATE public.products
SET
  description = $$Polera Heavy Cotton manga larga de 170 g confeccionada en algodón 100% fibra natural, con puño en muñeca y estructura tubular para conservar mejor la forma de la prenda. Su construcción reforzada aporta durabilidad, resistencia al desgaste y buena conservación del color, mientras el tratamiento antipilling mantiene una presentación limpia en el uso diario.$$,
  extract = $$Manga larga en algodón 100%, 170 g, con puño y estructura tubular resistente.$$,
  composition = $$100% algodón$$,
  weight = $$170 g$$,
  technologies = ARRAY['Antipilling', 'Estabilidad dimensional', 'Solidez de color por luz', 'Proteccion UPF+'],
  sizes = ARRAY['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']
WHERE slug = 'heavy-cotton-ml';

UPDATE public.products
SET
  description = $$Polera cuello camisa Essential de manga corta, desarrollada como una alternativa corporativa cómoda y funcional. Su tela soft touch entrega una sensación suave al tacto, con mezcla de algodón y poliéster que favorece la durabilidad, estabilidad dimensional y conservación del color. Es una opción versátil para uniformes de uso diario con buena relación precio/calidad.$$,
  extract = $$Polo corporativa soft touch, cómoda, durable y de excelente relación precio/calidad.$$,
  composition = $$60% algodón, 40% poliéster$$,
  weight = $$230 g$$,
  technologies = ARRAY['Antipilling', 'Estabilidad dimensional', 'Solidez de color por luz'],
  sizes = ARRAY['S', 'M', 'L', 'XL', '2XL', '3XL']
WHERE slug = 'cuello-camisa-essential';

UPDATE public.products
SET
  description = $$Polera cuello camisa Sport de tela liviana y fresca, ideal para trabajo activo, uso diario o actividades que requieren mayor movilidad. Su diseño tipo polo combina presentación corporativa con funcionalidad técnica, incorporando control de humedad, respirabilidad y secado rápido para mantener comodidad durante la jornada.$$,
  extract = $$Polo técnica liviana, respirable y de secado rápido para trabajo activo.$$,
  composition = $$60% algodón, 40% poliéster$$,
  weight = $$180 g$$,
  technologies = ARRAY['Control de humedad', 'Respirable', 'Secado rapido', 'Solidez de color por luz'],
  sizes = ARRAY['S', 'M', 'L', 'XL', '2XL', '3XL']
WHERE slug = 'cuello-camisa-sport';

UPDATE public.products
SET
  description = $$Polo Ejecutiva DryFresh de línea premium técnica, respirable y orientada a una imagen profesional superior. Su tela de 230 g combina algodón y poliéster con control de humedad y secado rápido, entregando comodidad, durabilidad y buena conservación de forma y color. Es una prenda liviana para uso corporativo exigente y actividades al aire libre.$$,
  extract = $$Polo premium técnica, respirable, liviana y de secado rápido.$$,
  composition = $$60% algodón, 40% poliéster$$,
  weight = $$230 g$$,
  technologies = ARRAY['Antipilling', 'Control de humedad', 'Durable', 'Estabilidad dimensional', 'Liviano', 'Secado rapido', 'Solidez de color por luz'],
  sizes = ARRAY['S', 'M', 'L', 'XL', '2XL', '3XL']
WHERE slug IN ('polo-ejecutiva-dryfresh', 'cuello-camisa-ejecutiva');

UPDATE public.products
SET
  description = $$Polerón cuello redondo de franela 280 g, diseñado para brindar comodidad, resistencia y una presentación impecable en el día a día. Su mezcla de algodón y poliéster aporta suavidad al tacto, durabilidad y tecnología antipilling para evitar la formación de bolitas. Mantiene su forma y color lavado tras lavado, ideal para uso corporativo, casual o jornadas de alta exigencia.$$,
  extract = $$Franela premium 280 g, resistente, cómoda y con tecnología antipilling.$$,
  composition = $$65% algodón, 35% poliéster$$,
  weight = $$280 g$$,
  technologies = ARRAY['Antipilling', 'Estabilidad dimensional', 'Solidez de color por luz', 'Durable'],
  sizes = ARRAY['S', 'M', 'L', 'XL', '2XL', '3XL']
WHERE slug = 'poleron-cuello-redondo-polo';

UPDATE public.products
SET
  description = $$Polerón clásico unisex de calce más ajustado, cómodo y versátil para uso diario o corporativo. Confeccionado en mezcla de algodón y poliéster, incorpora interior de felpa perchada térmica que entrega abrigo, suavidad y durabilidad. Sus puños y cintura elasticados aportan mejor ajuste para el uso continuo.$$,
  extract = $$Polerón unisex de felpa perchada térmica, cómodo y resistente para uso diario.$$,
  composition = $$50% algodón, 50% poliéster$$,
  weight = $$280 g/m²$$,
  technologies = ARRAY['Interior termico', 'Durable'],
  sizes = ARRAY['S', 'M', 'L', 'XL', '2XL', '3XL']
WHERE slug = 'poleron-polo-unisex';

UPDATE public.products
SET
  description = $$Polerón Canguro Premium Unisex confeccionado en franela de 280 g, mezcla de poliéster y algodón, diseñado para brindar comodidad, resistencia y estilo en el uso diario. Su tecnología antipilling ayuda a evitar la formación de bolitas y su estabilidad dimensional conserva la forma lavado tras lavado. Incluye capucha estilo canguro y está pensado para uso corporativo, urbano o casual.$$,
  extract = $$Polerón canguro premium en franela 280 g, durable, cómodo y antipilling.$$,
  composition = $$65% poliéster, 35% algodón$$,
  weight = $$280 g$$,
  technologies = ARRAY['Antipilling', 'Estabilidad dimensional', 'Solidez de color por luz', 'Durable'],
  sizes = ARRAY['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
WHERE slug = 'poleron-canguro';

UPDATE public.products
SET
  description = $$Softshell Basic diseñado para brindar protección térmica, resistencia al viento y comodidad en el trabajo o uso diario. Su construcción laminada repelente al agua ayuda a enfrentar condiciones climáticas cambiantes, mientras que sus múltiples bolsillos aportan funcionalidad y practicidad.$$,
  extract = $$Softshell 280 g con protección térmica, cortaviento y repelencia al agua.$$,
  composition = $$100% poliéster$$,
  weight = $$280 g$$,
  technologies = ARRAY['Proteccion termica', 'Cortaviento', 'Repelente al agua'],
  sizes = ARRAY['S', 'M', 'L', 'XL', '2XL', '3XL']
WHERE slug IN ('softshell-basico-hombre', 'softshell-basico-mujer');

UPDATE public.products
SET
  description = $$Softshell Térmico Premium diseñado para brindar máximo abrigo, comodidad y protección en climas fríos. Incorpora forro térmico, cuello interior de microfleece y puños elasticados con orificio para pulgar, entregando mayor confort y aislamiento térmico. Sus bolsillos con cierre aportan funcionalidad para trabajo y uso exterior.$$,
  extract = $$Softshell térmico premium con forro interior, microfleece y alta protección contra frío y viento.$$,
  composition = $$Softshell térmico premium$$,
  weight = NULL,
  technologies = ARRAY['Forro termico', 'Microfleece', 'Cortaviento', 'Resistente al frio'],
  sizes = ARRAY['S', 'M', 'L', 'XL', '2XL', '3XL']
WHERE slug IN ('softshell-termico-premium-hombre', 'softshell-termico-premium-mujer');

UPDATE public.products
SET
  description = $$Parka Softshell Térmica Premium de alto rendimiento, diseñada para entregar máximo abrigo, protección y comodidad en climas fríos. Su construcción tricapa con tecnología Breathable 3000/3000 ofrece resistencia al viento, repelencia al agua y transpirabilidad para un uso prolongado. Incluye ventilación bajo brazos, gorro desmontable y detalles reflectivos.$$,
  extract = $$Parka softshell tricapa premium, térmica, cortaviento, respirable y repelente al agua.$$,
  composition = $$Softshell tricapa$$,
  weight = NULL,
  technologies = ARRAY['Breathable 3000/3000', 'Repelente al agua', 'Cortaviento', 'Transpirable', 'Detalles reflectivos'],
  sizes = ARRAY['S', 'M', 'L', 'XL', '2XL', '3XL']
WHERE slug = 'chaqueta-parka-premium-softshell';
