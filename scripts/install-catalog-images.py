#!/usr/bin/env python3
"""Copy generated catalog art into public/images."""
from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path("/workspace")
ART = ROOT / "artifacts" / "imagine_images"
PUB = ROOT / "public" / "images"

PRODUCTS = {
    "macbook-air-13-m3": "d3f3cd47-ad1b-4183-94b7-ee783b242c43",
    "macbook-pro-14-m3": "befc13df-c99e-4e1f-a951-609039b90336",
    "dell-xps-15": "99babcb6-e71f-4676-945d-e5cf6f3c4c9e",
    "hp-pavilion-15": "b424c07a-6f05-406f-8599-b63e0f5d0f0d",
    "lenovo-thinkpad-e14": "65b38250-e3b2-414c-af07-aca5fdf403a8",
    "asus-zephyrus-g14": "570ee8b2-1614-4db1-a83a-e1fb2e139f57",
    "ipad-air-m2": "8e655a33-f810-4eb4-a01c-a0abd9fb8a56",
    "ipad-pro-11-m4": "5e13b3bd-eb1d-4e89-934f-f69ff7f21960",
    "galaxy-tab-s9": "eae55ce2-c779-492f-b031-953f7b8e842f",
    "lenovo-tab-p12": "135102ba-a49a-4d34-af6a-01f4ea7fc226",
    "iphone-16-pro": "61a9082b-60f2-491e-b198-2c752c3f95d7",
    "galaxy-s25": "72aab8fc-27b5-4585-a632-39cf66e00649",
    "pixel-9": "4eb2b5f5-cf83-49fc-9aa3-873fad84943c",
    "xiaomi-14": "e91939e6-f144-4eca-b8d1-6afa2d52d09c",
    "sony-wh-1000xm5": "ae8f18d2-e168-477f-a4d0-ead9c18bd7d1",
    "airpods-pro-2": "89a5062d-0376-4288-80e7-6949201d8eed",
    "bose-qc-ultra": "5690f951-354e-453b-8abe-f263aa7c23f4",
    "jbl-tune-770": "2487a9dd-4106-434c-9b2e-3e5adf10cdeb",
    "apple-watch-s10": "7d5f11c5-4172-4407-8893-39d8093520d2",
    "galaxy-watch-7": "f47523e2-44c9-4370-87b1-c09c29775bff",
    "huawei-watch-gt4": "7b25c576-db8e-4798-b21f-f9ba5cecc05a",
    "ps5-slim": "677470da-9d25-4306-ad56-b64dfc35955e",
    "xbox-series-x": "c321a075-798b-47c8-b0b1-645ec9996814",
    "switch-oled": "0c0138bf-60ed-414f-a623-8d137cb571f5",
    "dualsense-white": "c703f37b-2d54-45d0-bee9-523cebf361b3",
    "ea-fc-25": "aab1fa03-7121-4315-8967-17d20b891f02",
    "god-of-war-ragnarok": "adbb767f-15b9-4120-ac95-c8cba46a7936",
    "logitech-mx-keys": "cc632c08-7b46-41e2-bc60-bc164c6cc3f3",
    "logitech-mx-master-3s": "439fcf31-c5df-4721-a49f-82499eace1d4",
    "hp-laserjet-mfp": "6c26553b-62a3-46a3-a120-4f79d7161e84",
    "metal-pen-set": "9d34e23f-8879-4fe9-9375-57559c82e46a",
    "eastpak-backpack": "e1e040b0-106e-4946-a1f1-a28b3c2d4998",
    "casio-fx-991ex": "bba140eb-b0e5-48b6-9a1f-972495c8153d",
    "moleskine-cahier": "99959f15-a84e-43fb-b90f-4ed032ff0184",
    "geometry-set": "05bd0aaa-1e06-42de-98a1-6dc73e88b5a8",
    "faber-textliner": "40127b11-943f-4978-9bdd-269d8a222ecc",
    "anker-737": "cd1b7a70-a86d-479e-abcc-efd9ab69cae2",
    "usbc-hub-7in1": "e3ef5231-9a70-4c41-b25c-68ad39ac1e92",
    "laptop-sleeve-14": "2ed465ce-aa9c-4c6a-b776-30b6230c32d5",
    "magsafe-charger": "12328097-7dd6-4ac7-b064-e9d41b8a1f7a",
    "apple-pencil-pro": "da79c1da-3a23-4f61-9c69-c6496e32dd74",
    "atomic-habits": "651373a6-5ad3-4a08-b8f1-d2af6100c82c",
    "men-in-the-sun": "a247e495-294c-420a-8999-376630775196",
    "the-alchemist": "0e04697f-01e3-4268-aa83-46bdf6c10033",
    "rich-dad-poor-dad": "788c633d-516c-48ff-9b40-e49deffdfbec",
    "cairo-trilogy": "4456d08b-ee98-4690-aeeb-fb9ee49d7166",
    "peppa-arabic": "fcaf219f-0a54-488c-ae3e-a8a871732a46",
    "natgeo-kids-space": "2b639928-a1e2-4933-86eb-fa0588ebc387",
    "hbr-10": "4e501397-85e2-48d2-91ee-a81343328943",
}

CATS = {
    "books": "f97182a9-13a8-454b-ad94-7ef9a855edb5",
    "laptops": "c0a8f0d6-159e-45db-a3a4-98756f07bcae",
    "tablets": "6a2ad20a-9487-4eb1-80b1-e568a7fa46f5",
    "mobiles": "b6fbc47c-dbc0-41c3-8412-afe2bc9810ea",
    "headphones": "6a1a22e0-5925-40d2-8156-7470c5709610",
    "smartwatches": "9c38dd95-fe25-4e06-8e12-31023c24c90d",
    "gaming": "ac96275c-4be8-4488-a18b-ffc12fe613f2",
    "office": "d704ae65-87ef-4721-a2db-2475d08fb549",
    "school": "66eeca9f-d670-4deb-8916-965cc4d8b36b",
    "accessories": "92d436fc-f155-4467-81e7-0a1f4fa7414f",
}

HEROES = {
    "school": "0ee90314-a1ee-4b70-8861-1d6cd5eb7e6f",
    "laptops": "12be957c-42be-4f45-b673-2d07b4d65eab",
    "electronics": "9cdf4aba-f106-41d0-a229-9965d3a9f247",
    "books": "423ef6fa-b56b-45e5-9b64-5e1f76859844",
    "gaming": "22d26309-5924-4db5-83c9-8c39d5b4cade",
    "tablets": "84c21efa-4871-43c8-a23e-7c0193734765",
}


def copy_jpeg(src_id: str, dest: Path) -> None:
    src = ART / f"{src_id}.jpg"
    if not src.exists():
        raise SystemExit(f"missing {src}")
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dest)
    print(f"{dest.relative_to(ROOT)}  {dest.stat().st_size // 1024} KB")


def main() -> None:
    missing = []
    for pid, aid in PRODUCTS.items():
        if not (ART / f"{aid}.jpg").exists():
            missing.append(pid)
    if missing:
        raise SystemExit("missing products: " + ", ".join(missing))
    for pid, aid in PRODUCTS.items():
        copy_jpeg(aid, PUB / "products" / f"{pid}.jpg")
    for name, aid in CATS.items():
        copy_jpeg(aid, PUB / "categories" / f"{name}.jpg")
    for name, aid in HEROES.items():
        copy_jpeg(aid, PUB / "heroes" / f"{name}.jpg")
    print(f"copied {len(PRODUCTS)} products, {len(CATS)} categories, {len(HEROES)} heroes")


if __name__ == "__main__":
    main()
