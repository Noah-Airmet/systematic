async function testPatch() {
    const testNodeId = "b15ba5aa-46b8-4427-b0fe-982eb477e2ae"; // The ID from our test insert earlier
    const res = await fetch(`http://localhost:3000/api/nodes/${testNodeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Updated Title for real" })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
}

testPatch();
