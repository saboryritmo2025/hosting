const PDF = {
  create(text) {
    const pdf = `%PDF-1.1
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Count 1 /Kids [3 0 R]>> endobj
3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 300 300] /Contents 4 0 R>> endobj
4 0 obj <</Length ${text.length + 40}>> stream
BT /F1 12 Tf 20 250 Td (${text.replace(/\n/g, " ")}) Tj ET
endstream endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000115 00000 n 
0000000200 00000 n 
trailer <</Size 5 /Root 1 0 R>>
startxref
300
%%EOF`;

    return new Blob([pdf], { type: "application/pdf" });
  }
};
