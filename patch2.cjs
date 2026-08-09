const fs = require('fs');
let code = fs.readFileSync('src/components/PublicDashboardView.tsx', 'utf8');

const regex = /const \[beneficiaries\] = useState<MBGBeneficiary\[\]>\(\(\) => \{[\s\S]*?return allBeneficiaries;\n  \}\);/m;

const replacement = `const beneficiaries = useMemo(() => {
    let allBeneficiaries: MBGBeneficiary[] = [];
    if (data?.beneficiaries && data.beneficiaries.length > 0) {
      allBeneficiaries = data.beneficiaries;
    } else {
      const storedMBG = localStorage.getItem("orbit_gizi_local_beneficiaries");
      if (storedMBG) {
        try {
          const parsed: MBGBeneficiary[] = JSON.parse(storedMBG);
          const validMBG = parsed.filter(b => b.id && !b.id.startsWith("ben_ngt_") && !b.id.startsWith("b1") && b.id !== "b1" && b.id !== "b2" && b.id !== "b3" && b.id !== "b4" && b.id !== "b5");
          allBeneficiaries = [...allBeneficiaries, ...validMBG];
        } catch {
          // ignore
        }
      }
    }
    const storedHamil = localStorage.getItem("orbit_gizi_ibu_hamil");
    if (storedHamil) {
      try {
        const parsedHamil: any[] = JSON.parse(storedHamil);
        const mappedHamil = parsedHamil.map(b => ({
          id: b.id,
          name: b.namaIbu,
          category: "Ibu Hamil",
          location: {
            propinsi: "Nusa Tenggara Timur",
            kabupaten: "Nagekeo",
            puskesmas: b.puskesmas || "",
            kelurahan: b.kelurahan || "",
            dusun: b.dusun || "",
            posyandu: b.posyandu || ""
          },
          isReceivedMBG: false,
          isReceivedPMT: true,
          weightRecords: b.weightRecords || []
        } as unknown as MBGBeneficiary));
        allBeneficiaries = [...allBeneficiaries, ...mappedHamil];
      } catch {
        // ignore
      }
    }
    const storedMenyusui = localStorage.getItem("orbit_gizi_ibu_menyusui");
    if (storedMenyusui) {
      try {
        const parsedMenyusui: any[] = JSON.parse(storedMenyusui);
        const mappedMenyusui = parsedMenyusui.map(b => ({
          id: b.id,
          name: b.namaIbu,
          category: "Ibu Menyusui",
          location: {
            propinsi: "Nusa Tenggara Timur",
            kabupaten: "Nagekeo",
            puskesmas: b.puskesmas || "",
            kelurahan: b.kelurahan || "",
            dusun: b.dusun || "",
            posyandu: b.posyandu || ""
          },
          isReceivedMBG: false,
          isReceivedPMT: true,
          weightRecords: b.weightRecords || []
        } as unknown as MBGBeneficiary));
        allBeneficiaries = [...allBeneficiaries, ...mappedMenyusui];
      } catch {
        // ignore
      }
    }
    return allBeneficiaries;
  }, [data]);`;

if (regex.test(code)) {
  fs.writeFileSync('src/components/PublicDashboardView.tsx', code.replace(regex, replacement));
  console.log("Replaced beneficiaries state with useMemo");
} else {
  console.log("Regex did not match");
}
