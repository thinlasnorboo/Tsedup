import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListProductsResponse,
  CreateProductBody,
  CreateProductResponse,
  UpdateProductParams,
  UpdateProductBody,
  UpdateProductResponse,
  DeleteProductParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const SEED_PRODUCTS = [
  // ── Off-Road RTR ─────────────────────────────────────────────────────────────
  { name: "MJX Hyper Go 10303 Citroën C3 WRC 1:10",         description: "1:10 scale RC car, high performance brushless motor, 4WD, ready-to-run.",                        price: 32000, category: "Off-Road RTR",         featured: true,  inStock: true,  stock: 5,  imageUrl: "https://shop.robitronic.com/media/image/85/23/8e/mjx-mx-10303-pic1_0028_600x600.jpg" },
  { name: "MJX Hyper Go 10210 1/10 Brushless RC",           description: "1/10 scale brushless RC off-road car, high-speed with excellent traction.",                       price: 34810, category: "Off-Road RTR",         featured: true,  inStock: true,  stock: 3,  imageUrl: "https://techtonichobbies.com.au/cdn/shop/files/MJX-10210-G.jpg?v=1770854586&width=600" },
  { name: "Rlaarlo Omni RZ001B-C Carbon Brushless RTR",     description: "1:10 scale carbon fiber brushless RTR off-road RC car with outstanding performance.",             price: 29500, category: "Off-Road RTR",         featured: false, inStock: true,  stock: 4,  imageUrl: "https://rlaarlo.com/cdn/shop/files/RZ001B-C_3.jpg?v=1754903881&width=1500" },
  { name: "WLToys 12427/12428 1/12 Offroader",              description: "1/12 scale 4WD off-road rock crawler, waterproof, great for all terrains.",                       price: 11900, category: "Off-Road RTR",         featured: false, inStock: true,  stock: 8,  imageUrl: "https://i0.wp.com/hobbypalace.pk/wp-content/uploads/2024/01/3d46998d1ca12217c47d17ed745351a0.jpg?fit=700%2C700&ssl=1" },
  { name: "MJX 14208 1:14 Scale 4WD Brushless RC",          description: "1:14 scale 4WD brushless RC car, fast and agile for off-road adventures.",                       price: 17700, category: "Off-Road RTR",         featured: false, inStock: true,  stock: 6,  imageUrl: "https://www.seriousrc.co.uk/cdn/shop/files/14208_1_-1-Photoroom.jpg?v=1764517591" },
  { name: "MJX Hyper Go 14207 Brushless 1/14 RC",           description: "1/14 scale brushless RC off-road car, high-speed with durable design.",                          price: 15500, category: "Off-Road RTR",         featured: false, inStock: true,  stock: 7,  imageUrl: "https://www.helidirect.com/cdn/shop/files/MJX-Hyper-Go-14207-Brushless-114-RC-Car-_-53kmh-4WD-Off-Road-Racing.webp?v=1758158777" },
  { name: "Rlaarlo Omni RZ001 1:10 Scale RTR",              description: "1:10 scale off-road RTR RC car, full feature set for serious hobbyists.",                         price: 25000, category: "Off-Road RTR",         featured: false, inStock: true,  stock: 4,  imageUrl: "https://rlaarlo.com/cdn/shop/files/Rlaarlo_RC_Monster_Truck_rz001.jpg?v=1754903881" },
  { name: "M78 High Simulation 4X4 Alloy Remote Control",   description: "High simulation 4X4 alloy body remote control off-road truck with realistic detailing.",          price: 7500,  category: "Off-Road RTR",         featured: false, inStock: true,  stock: 10, imageUrl: "https://www.playpulserc.com/cdn/shop/files/GS162_1_16__03.png?v=1771085360&width=3628" },
  { name: "MJX H12Y Hyper Go 1:12 RC Truck",                description: "1:12 scale off-road RC truck with powerful motor and robust suspension.",                         price: 18500, category: "Off-Road RTR",         featured: false, inStock: true,  stock: 5,  imageUrl: "https://cdn-global-hk.hobbyking.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/a/7/a772725c-db0b-48ec-a892-7d6b912f99a6.jpg" },
  { name: "FMS 1:18 FSC18 Ford Bronco RTR EB",              description: "1:18 scale Ford Bronco RTR electric brushed, iconic body with off-road capability.",              price: 23500, category: "Off-Road RTR",         featured: false, inStock: true,  stock: 3,  imageUrl: "https://www.fmshobby.com/cdn/shop/files/FSC18FordBronco_1.jpg?v=1774504145&width=1946" },
  // ── On-Road RTR ──────────────────────────────────────────────────────────────
  { name: "MJX HYPER GO 10306 1/10 2.4G 4WD Sport",        description: "1/10 scale 4WD sport on-road RC car, brushless with 2.4GHz remote.",                             price: 28000, category: "On-Road RTR",          featured: true,  inStock: true,  stock: 5,  imageUrl: "https://rc-wing.com/cdn/shop/files/MJX10306-01.png?crop=center&height=1200&v=1776845375&width=1200" },
  { name: "WL Toys K999 Drift Rc Cars",                     description: "High-speed drift RC car, smooth handling for track and street drift sessions.",                   price: 8673,  category: "On-Road RTR",          featured: false, inStock: true,  stock: 12, imageUrl: "https://www.wl-toys.com/images/product/RC-Cars/Wltoys/Wltoys-K999/1.jpg" },
  { name: "LD2801 Full-scale Four-wheel Drive RC",          description: "Full-scale four-wheel drive on-road RC car, great for beginner drift enthusiasts.",               price: 2500,  category: "On-Road RTR",          featured: false, inStock: true,  stock: 15, imageUrl: "https://chinahobbyline.com/cdn/shop/files/1_7719150f-610d-4906-baf1-400fdc125de2_700x700.jpg?v=1758607168" },
  { name: "1/10 Carbon Fiber Brushless RTR 4WD Rally",      description: "1/10 scale carbon fiber brushless 4WD rally car, competition-grade performance.",                price: 32000, category: "On-Road RTR",          featured: true,  inStock: true,  stock: 3,  imageUrl: "https://rlaarlo.com/cdn/shop/files/XTS-S10_1.jpg?v=1762760584" },
  { name: "MJX Hyper Go 14303 High-Speed 1/14",            description: "High-speed 1/14 scale on-road RC car with brushless motor for fast runs.",                        price: 14750, category: "On-Road RTR",          featured: false, inStock: true,  stock: 6,  imageUrl: "https://chinahobbyline.com/cdn/shop/files/1_7719150f-610d-4906-baf1-400fdc125de2_700x700.jpg?v=1758607168" },
  { name: "WL Toys K959 Drift Rc Cars",                     description: "K959 drift RC car with smooth chassis for controlled drift maneuvers.",                            price: 8555,  category: "On-Road RTR",          featured: false, inStock: true,  stock: 10, imageUrl: "https://www.wl-toys.com/images/product/RC-Cars/Wltoys/Wltoys-K959/1.jpg" },
  { name: "Hyper Go 14302 1/14 ONROAD",                    description: "1/14 scale on-road RC car with Hyper Go technology, ready-to-run.",                               price: 15500, category: "On-Road RTR",          featured: false, inStock: true,  stock: 7,  imageUrl: "https://thetruckmonster.co.uk/cdn/shop/files/8b4aafe2-bdc8-4c57-9313-c0064c732bd1_1000x_ab7d3b98-c7d6-4e0b-adc7-2199906f89bc.webp?v=1762469349&width=1946" },
  { name: "Rlaarlo 1/10 Scale Brushless RTR Rally",         description: "1/10 scale brushless RTR rally car, carbon fiber chassis, pro-level speed.",                     price: 35499, category: "On-Road RTR",          featured: true,  inStock: true,  stock: 2,  imageUrl: "https://rlaarlo.com/cdn/shop/files/XTS-S10_10.jpg?v=1762760933&width=1500" },
  // ── Construction Vehicles ─────────────────────────────────────────────────────
  { name: "Huina 1501 1/18 2.4G 19CH Scania Tractor",      description: "1/18 scale Scania tractor with 19 channels and 2.4GHz remote control, highly detailed.",         price: 17110, category: "Construction Vehicles", featured: false, inStock: true,  stock: 4,  imageUrl: "https://huinaconstructiontoys.com/cdn/shop/files/Sea129041d63a4584994ad580124e3d19j_grande.webp?v=1764394259" },
  { name: "Huina 1553 RC Excavator 1/14",                   description: "1/14 scale RC excavator with realistic arm movements and metal bucket.",                          price: 6600,  category: "Construction Vehicles", featured: false, inStock: true,  stock: 6,  imageUrl: "https://www.daddydrones.in/image/cache/catalog/1%20HIGH%20SPEED%20CAR/HUINA/1553/MAIN/1-600x315w.jpg" },
  { name: "Huina 1593 RC Excavator",                        description: "Professional RC excavator with multi-function arm control and durable build.",                    price: 21930, category: "Construction Vehicles", featured: true,  inStock: true,  stock: 3,  imageUrl: "https://www.technohobbies.com.au/cdn/shop/products/TR1283_1200x1200.jpg?v=1662461445" },
  { name: "Huina 1585 Remote Control Alloy Tower Crane",    description: "1.2M tall alloy RC tower crane with 2.4GHz remote, lights and realistic operation.",             price: 9000,  category: "Construction Vehicles", featured: true,  inStock: true,  stock: 3,  imageUrl: "https://hobbycrazy.com.au/wp-content/uploads/2022/06/rc-crane-huina-1585-diecast-alloy-metal-rc-engineering.jpg" },
  { name: "Huina 1502 73.5cm 3-Axle Semi Trailer",         description: "73.5cm semi trailer truck with 3-axle design, heavy hauler RC vehicle.",                         price: 7965,  category: "Construction Vehicles", featured: false, inStock: true,  stock: 5,  imageUrl: "https://huinaconstructiontoys.com/cdn/shop/files/S6a0026abb2344740997e93ed6d6db2f0A_grande.webp?v=1764394259" },
  { name: "HUINA 1572 1:14 RC Truck Crane 15CH",           description: "1:14 scale 15-channel RC truck crane with metal hook and rotating platform.",                     price: 10000, category: "Construction Vehicles", featured: false, inStock: true,  stock: 4,  imageUrl: "https://www.onlinetoys.com.au/wp-content/uploads/2025/05/Huina-1572-RC-Crawler-Crane-with-log-lifting--1400x1400.jpg" },
  { name: "Huina 1537 PRO 1:14 Alloy RC Cement Mixer",     description: "1:14 scale alloy RC cement mixer truck, motorized drum with realistic mixing action.",            price: 10000, category: "Construction Vehicles", featured: false, inStock: true,  stock: 5,  imageUrl: "https://cdn.hobbiesdirect.com.au/fit-in/900x600/products/146241/1537_004.jpg" },
  { name: "TRASPED HG4-414 1:64 Scale Mini RC Dump",       description: "1:64 scale mini RC dump truck, compact and fun for kids and collectors.",                         price: 1950,  category: "Construction Vehicles", featured: false, inStock: true,  stock: 20, imageUrl: "https://wp.youcliq.com/wp-content/uploads/2026/01/TRASPED-HG4-414-164-Scale-Mini-RC-Alloy-Dump-Truck-3.jpg" },
  { name: "TRASPED HG4-413 1:64 Scale Mini RC Excavator",  description: "1:64 scale mini RC excavator, detailed and functional arm movement.",                             price: 1950,  category: "Construction Vehicles", featured: false, inStock: true,  stock: 20, imageUrl: "https://brrrrt.com/cdn/shop/files/brrrrt-1-64-rc-mini-excavator-digging-action.jpg?v=1772692058&width=1946" },
  { name: "New Huina 1538 1/14th 3in1 Alloy RC",           description: "1/14 scale 3-in-1 alloy RC construction vehicle with interchangeable attachments.",               price: 20000, category: "Construction Vehicles", featured: true,  inStock: true,  stock: 3,  imageUrl: "https://www.toucanhobby.eu/cdn/shop/files/364A8532_1200x1200.jpg?v=1754356464" },
  { name: "Huina 1582 Dump Truck 1/14",                    description: "1/14 scale RC dump truck with hydraulic lifting bed, powerful motor.",                            price: 25000, category: "Construction Vehicles", featured: false, inStock: true,  stock: 3,  imageUrl: "https://crazyrc.com/cdn/shop/files/3_f35c2d44-78cd-4a79-a963-e4f908676f4f_1200x1200.jpg?v=1758356922" },
  { name: "Original Remote Control Part for Construction",  description: "Genuine replacement remote control handset compatible with Huina construction vehicles.",          price: 5600,  category: "Construction Vehicles", featured: false, inStock: true,  stock: 8,  imageUrl: "https://huinaconstructiontoys.com/cdn/shop/products/H09284c6e907c4343bacc5b7e5f9ea1989_250x.jpg?v=1664341414" },
  // ── Batteries ─────────────────────────────────────────────────────────────────
  { name: "HUINA 3 PIN 3000mAh Li-Ion Battery",            description: "Original HUINA 3-pin 3000mAh Li-Ion battery, compatible with HUINA RC vehicles.",                price: 1500,  category: "Batteries",            featured: false, inStock: true,  stock: 15, imageUrl: "https://static.wixstatic.com/media/ba3ae6_71dba2aadee04b558336148ad9c910d0~mv2.jpg/v1/fit/w_500,h_500,q_90/file.jpg" },
  { name: "HUINA 4 PIN 3000mAh Li-Ion Battery",            description: "Original HUINA 4-pin 3000mAh Li-Ion battery, compatible with HUINA RC vehicles.",                price: 1500,  category: "Batteries",            featured: false, inStock: true,  stock: 15, imageUrl: "https://static.wixstatic.com/media/ba3ae6_00a9fbf20ca84558ab75043854757088~mv2.jpg/v1/fit/w_500,h_500,q_90/file.jpg" },
  { name: "2S 7.4V 5200mAh 35C LiPo Battery w EC5",       description: "High-capacity 2S 7.4V 5200mAh 35C LiPo battery with EC5 connector for RC cars.",                price: 2500,  category: "Batteries",            featured: true,  inStock: true,  stock: 10, imageUrl: "https://www.powerhobby.com/cdn/shop/products/ph-2s-5200mah-35c-ec5.jpg?v=1778798465" },
  { name: "FTX Vortex High Speed Li-Ion 7.4V",             description: "FTX Vortex high-speed 7.4V Li-Ion battery, reliable power for extended run times.",              price: 1200,  category: "Batteries",            featured: false, inStock: true,  stock: 12, imageUrl: "https://ftx-rc.com/image/cache/data/FTX0721-420x420.jpg" },
  { name: "Sea Jump 2S 7.4V 25C 3000mAh LiPo",            description: "2S 7.4V 25C 3000mAh LiPo battery, lightweight and high performance for RC use.",                 price: 2600,  category: "Batteries",            featured: false, inStock: true,  stock: 10, imageUrl: "https://cdn11.bigcommerce.com/s-jl18qwfl9e/images/stencil/558x558/products/5800/13290/730_md__15748.1741724989.jpg?c=1" },
  { name: "MJX Hyper Go B3105 3S 11.1V 1050mAh",          description: "Original MJX Hyper Go 3S 11.1V 1050mAh LiPo battery for MJX RC vehicles.",                      price: 2300,  category: "Batteries",            featured: false, inStock: true,  stock: 8,  imageUrl: "https://www.helidirect.com/cdn/shop/files/Image_20240207135016.png?v=1707288718" },
  // ── Chargers ──────────────────────────────────────────────────────────────────
  { name: "HOTA T8 Ultra 650W 1-8S AC/DC Charger",         description: "Professional 650W 1-8S AC/DC balance charger, supports LiPo, LiHV, NiMH and more.",             price: 8550,  category: "Chargers",             featured: true,  inStock: true,  stock: 4,  imageUrl: "https://iflight-rc.eu/cdn/shop/files/hota-t8-ultra-650w-1-8s-acdc-smart-charger-7132769.png?v=1763030114" },
  { name: "ISDT BG-8S 8S BattGO Smart Charger",            description: "Compact BattGO smart charger supporting up to 8S LiPo, fast and accurate balancing.",            price: 4000,  category: "Chargers",             featured: false, inStock: true,  stock: 5,  imageUrl: "https://www.isdt.co/wp-content/uploads/2018/11/bg8s.jpg" },
  { name: "MJX HyperGo P2050 Original USB Charger",        description: "Original MJX HyperGo USB charger for MJX RC vehicles, safe and efficient charging.",             price: 600,   category: "Chargers",             featured: false, inStock: true,  stock: 20, imageUrl: "https://images.amainhobbies.com/images/large/mjx/mjx-p2050.jpg" },
  // ── Connectors ────────────────────────────────────────────────────────────────
  { name: "SafeConnect XT60 Male Connector",                description: "XT60 male bullet connector, gold-plated for low resistance and reliable power transfer.",         price: 187,   category: "Connectors",           featured: false, inStock: true,  stock: 50, imageUrl: "https://a.pololu-files.com/picture/0J2918.1200x627.jpg?357d11ab177ee1e9e502e96bfb066558" },
  { name: "EC3 Connector Bullet Plug For RC LiPo",         description: "EC3 bullet plug connector for RC LiPo batteries, easy to solder and very durable.",              price: 29,    category: "Connectors",           featured: false, inStock: true,  stock: 100,imageUrl: "https://www.progressiverc.com/cdn/shop/products/ac-ec3m_male_ec3_connectors_1_1024x1024.png?v=1595469578" },
  { name: "TRAXXAS TRX-style Connector Plugs",              description: "TRX-style connector plugs compatible with Traxxas RC vehicles, reliable fit.",                   price: 71,    category: "Connectors",           featured: false, inStock: true,  stock: 80, imageUrl: "https://cdn11.bigcommerce.com/s-q0oivn9r3h/images/stencil/original/products/814/581/TRA3060-2__22394.1562581986.jpg?c=2" },
];

async function seedIfEmpty() {
  const existing = await db.select().from(productsTable).limit(1);
  if (existing.length === 0) {
    await db.insert(productsTable).values(SEED_PRODUCTS);
  }
}

router.get("/products", async (_req, res): Promise<void> => {
  await seedIfEmpty();
  const rows = await db.select().from(productsTable);
  res.json(ListProductsResponse.parse(rows));
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [product] = await db.insert(productsTable).values(parsed.data).returning();
  res.status(201).json(CreateProductResponse.parse(product));
});

router.patch("/products/:id", async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateProductBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [product] = await db
    .update(productsTable)
    .set(body.data)
    .where(eq(productsTable.id, params.data.id))
    .returning();
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(UpdateProductResponse.parse(product));
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [product] = await db
    .delete(productsTable)
    .where(eq(productsTable.id, params.data.id))
    .returning();
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
