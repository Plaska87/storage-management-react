import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3002;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Database setup - Using actual SQLite database
const dbPath = path.join(__dirname, "storage_database.db");

// Initialize SQLite database connection
let db;

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    // Check if database file exists
    if (!fs.existsSync(dbPath)) {
      console.error("❌ SQLite database file not found!");
      console.error(`Expected location: ${dbPath}`);
      console.error(
        "Please create the database file first using DB Browser for SQLite"
      );
      reject(new Error("Database file not found"));
      return;
    }

    // Connect to SQLite database
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("❌ Error connecting to database:", err);
        reject(err);
        return;
      }

      const stats = fs.statSync(dbPath);
      console.log(`✅ Connected to SQLite database: ${dbPath}`);
      console.log(`📏 Database file size: ${stats.size} bytes`);

      // Test the connection and get material count
      db.get("SELECT COUNT(*) as count FROM materials", (err, row) => {
        if (err) {
          console.error("❌ Error querying database:", err);
          reject(err);
          return;
        }

        console.log(`📊 Database contains ${row.count} materials`);
        resolve();
      });
    });
  });
};

// Helper function to get next ID
const getNextId = () => {
  return new Promise((resolve, reject) => {
    db.get("SELECT MAX(id) as maxId FROM materials", (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve((row.maxId || 0) + 1);
    });
  });
};

// API Routes

// Get all active materials
app.get("/api/materials", (req, res) => {
  const query = `
    SELECT * FROM materials
    WHERE when_taken IS NULL
    ORDER BY when_stored DESC
  `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error("Error fetching materials:", err);
      res.status(500).json({ error: "Failed to fetch materials" });
      return;
    }
    res.json(rows);
  });
});

// Add new material
app.post("/api/materials", async (req, res) => {
  try {
    const { material_name, location, quantity } = req.body;

    if (!material_name || !location) {
      return res
        .status(400)
        .json({ error: "Material name and location are required" });
    }

    const now = new Date().toISOString();
    const nextId = await getNextId();

    const insertQuery = `
      INSERT INTO materials (id, material_name, location, quantity, when_stored, when_taken, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      insertQuery,
      [
        nextId,
        material_name,
        location,
        parseInt(quantity) || 1,
        now,
        null,
        now,
        now,
      ],
      function (err) {
        if (err) {
          console.error("Error adding material:", err);
          res.status(500).json({ error: "Failed to add material" });
          return;
        }

        const newMaterial = {
          id: nextId,
          material_name,
          location,
          quantity: parseInt(quantity) || 1,
          when_stored: now,
          when_taken: null,
          created_at: now,
          updated_at: now,
        };

        console.log(`Added material: ${material_name} at ${location}`);
        res.json(newMaterial);
      }
    );
  } catch (error) {
    console.error("Error adding material:", error);
    res.status(500).json({ error: "Failed to add material" });
  }
});

// Update material
app.put("/api/materials/:id", (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // First check if material exists
    db.get(
      "SELECT * FROM materials WHERE id = ?",
      [parseInt(id)],
      (err, row) => {
        if (err) {
          console.error("Error finding material:", err);
          res.status(500).json({ error: "Failed to find material" });
          return;
        }

        if (!row) {
          return res.status(404).json({ error: "Material not found" });
        }

        // Build update query dynamically
        const updateFields = [];
        const updateValues = [];

        if (updates.material_name) {
          updateFields.push("material_name = ?");
          updateValues.push(updates.material_name);
        }
        if (updates.location) {
          updateFields.push("location = ?");
          updateValues.push(updates.location);
        }
        if (updates.quantity !== undefined) {
          updateFields.push("quantity = ?");
          updateValues.push(parseInt(updates.quantity));
        }

        updateFields.push("updated_at = ?");
        updateValues.push(new Date().toISOString());
        updateValues.push(parseInt(id));

        const updateQuery = `
        UPDATE materials
        SET ${updateFields.join(", ")}
        WHERE id = ?
      `;

        db.run(updateQuery, updateValues, function (err) {
          if (err) {
            console.error("Error updating material:", err);
            res.status(500).json({ error: "Failed to update material" });
            return;
          }

          // Get updated material
          db.get(
            "SELECT * FROM materials WHERE id = ?",
            [parseInt(id)],
            (err, updatedRow) => {
              if (err) {
                console.error("Error fetching updated material:", err);
                res
                  .status(500)
                  .json({ error: "Failed to fetch updated material" });
                return;
              }

              console.log(`Updated material ID ${id}`);
              res.json(updatedRow);
            }
          );
        });
      }
    );
  } catch (error) {
    console.error("Error updating material:", error);
    res.status(500).json({ error: "Failed to update material" });
  }
});

// Remove material (mark as taken)
app.delete("/api/materials/:id", (req, res) => {
  try {
    const { id } = req.params;

    // First check if material exists and is not already taken
    db.get(
      "SELECT * FROM materials WHERE id = ? AND when_taken IS NULL",
      [parseInt(id)],
      (err, row) => {
        if (err) {
          console.error("Error finding material:", err);
          res.status(500).json({ error: "Failed to find material" });
          return;
        }

        if (!row) {
          return res
            .status(404)
            .json({ error: "Material not found or already taken" });
        }

        // Mark as taken
        const now = new Date().toISOString();
        const updateQuery = `
          UPDATE materials
          SET when_taken = ?, updated_at = ?
          WHERE id = ?
        `;

        db.run(updateQuery, [now, now, parseInt(id)], function (err) {
          if (err) {
            console.error("Error removing material:", err);
            res.status(500).json({ error: "Failed to remove material" });
            return;
          }

          console.log(`Removed material ID ${id}`);
          res.json({ success: true, message: "Material marked as taken" });
        });
      }
    );
  } catch (error) {
    console.error("Error removing material:", error);
    res.status(500).json({ error: "Failed to remove material" });
  }
});

// Search materials
app.get("/api/materials/search/:term", (req, res) => {
  try {
    const { term } = req.params;
    const searchQuery = `
      SELECT * FROM materials
      WHERE when_taken IS NULL
      AND (LOWER(material_name) LIKE LOWER(?) OR LOWER(location) LIKE LOWER(?))
      ORDER BY when_stored DESC
    `;

    const searchTerm = `%${term}%`;

    db.all(searchQuery, [searchTerm, searchTerm], (err, rows) => {
      if (err) {
        console.error("Error searching materials:", err);
        res.status(500).json({ error: "Failed to search materials" });
        return;
      }
      res.json(rows);
    });
  } catch (error) {
    console.error("Error searching materials:", error);
    res.status(500).json({ error: "Failed to search materials" });
  }
});

// Get materials by location
app.get("/api/materials/location/:location", (req, res) => {
  try {
    const { location } = req.params;
    const locationQuery = `
      SELECT * FROM materials
      WHERE location = ? AND when_taken IS NULL
      ORDER BY when_stored DESC
    `;

    db.all(locationQuery, [location], (err, rows) => {
      if (err) {
        console.error("Error fetching materials by location:", err);
        res
          .status(500)
          .json({ error: "Failed to fetch materials by location" });
        return;
      }
      res.json(rows);
    });
  } catch (error) {
    console.error("Error fetching materials by location:", error);
    res.status(500).json({ error: "Failed to fetch materials by location" });
  }
});

// Get material history
app.get("/api/materials/history", (req, res) => {
  const historyQuery = `
    SELECT *,
    CASE
      WHEN when_taken IS NULL THEN 'STORED'
      ELSE 'REMOVED'
    END as status
    FROM materials
    ORDER BY when_stored DESC
  `;

  db.all(historyQuery, (err, rows) => {
    if (err) {
      console.error("Error fetching material history:", err);
      res.status(500).json({ error: "Failed to fetch material history" });
      return;
    }
    res.json(rows);
  });
});

// Get statistics
app.get("/api/statistics", (req, res) => {
  const statsQueries = {
    totalActive:
      "SELECT COUNT(*) as count FROM materials WHERE when_taken IS NULL",
    totalQuantity:
      "SELECT SUM(quantity) as sum FROM materials WHERE when_taken IS NULL",
    totalHistorical: "SELECT COUNT(*) as count FROM materials",
    uniqueLocations:
      "SELECT COUNT(DISTINCT location) as count FROM materials WHERE when_taken IS NULL",
    uniqueMaterials:
      "SELECT COUNT(DISTINCT material_name) as count FROM materials WHERE when_taken IS NULL",
  };

  const stats = {};
  let completedQueries = 0;
  const totalQueries = Object.keys(statsQueries).length;

  Object.entries(statsQueries).forEach(([key, query]) => {
    db.get(query, (err, row) => {
      if (err) {
        console.error(`Error fetching ${key}:`, err);
        stats[key] = 0;
      } else {
        stats[key] = row.count || row.sum || 0;
      }

      completedQueries++;
      if (completedQueries === totalQueries) {
        res.json(stats);
      }
    });
  });
});

// Import data
app.post("/api/import", async (req, res) => {
  try {
    const { materials } = req.body;

    if (!Array.isArray(materials)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    let imported = 0;
    let nextId = await getNextId();

    const insertQuery = `
      INSERT INTO materials (id, material_name, location, quantity, when_stored, when_taken, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const stmt = db.prepare(insertQuery);

    materials.forEach((material) => {
      const now = new Date().toISOString();
      stmt.run(
        [
          nextId++,
          material.material_name,
          material.location,
          material.quantity || 1,
          material.when_stored || material.put_on_rack || now,
          material.when_taken || material.taken_from_rack || null,
          now,
          now,
        ],
        (err) => {
          if (err) {
            console.error("Error importing material:", err);
          } else {
            imported++;
          }
        }
      );
    });

    stmt.finalize((err) => {
      if (err) {
        console.error("Error finalizing import:", err);
        res.status(500).json({ error: "Failed to import data" });
        return;
      }

      console.log(`Imported ${imported} materials`);
      res.json({ success: true, imported });
    });
  } catch (error) {
    console.error("Error importing data:", error);
    res.status(500).json({ error: "Failed to import data" });
  }
});

// Export data
app.get("/api/export", (req, res) => {
  const exportQuery = "SELECT * FROM materials ORDER BY when_stored DESC";

  db.all(exportQuery, (err, rows) => {
    if (err) {
      console.error("Error exporting data:", err);
      res.status(500).json({ error: "Failed to export data" });
      return;
    }

    const exportData = {
      materials: rows,
      exportDate: new Date().toISOString(),
      version: "1.0",
      metadata: {
        dbFile: dbPath,
        dbSize: fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0,
      },
    };

    res.json(exportData);
  });
});

// Health check
app.get("/api/health", (req, res) => {
  if (!db) {
    return res.status(500).json({
      status: "ERROR",
      database: "disconnected",
      error: "Database not initialized",
      timestamp: new Date().toISOString(),
    });
  }

  db.get(
    "SELECT COUNT(*) as total, SUM(CASE WHEN when_taken IS NULL THEN 1 ELSE 0 END) as active FROM materials",
    (err, row) => {
      if (err) {
        res.status(500).json({
          status: "ERROR",
          database: "error",
          error: err.message,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.json({
        status: "OK",
        database: "connected",
        dbPath: dbPath,
        materialsCount: row.total || 0,
        activeMaterials: row.active || 0,
        timestamp: new Date().toISOString(),
        metadata: {
          dbFile: dbPath,
          dbSize: fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0,
        },
      });
    }
  );
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`\n🚀 Storage Management Database Server`);
      console.log(`📡 Server running at: http://localhost:${port}`);
      console.log(`💾 SQLite Database file: ${dbPath}`);
      console.log(
        `� API endpoints available at: http://localhost:${port}/api/`
      );
      console.log(`\nPress Ctrl+C to stop the server\n`);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to initialize database:", error);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down server...");
  if (db) {
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err);
      } else {
        console.log("Database connection closed.");
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on("SIGTERM", () => {
  console.log("\nShutting down server...");
  if (db) {
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err);
      } else {
        console.log("Database connection closed.");
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
