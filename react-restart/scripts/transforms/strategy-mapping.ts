/**
 * POWLAX Strategy Mapping Script
 * Consolidates strategy data from source CSV into target CSV with JSONB arrays
 */

import fs from 'fs';
import { parse } from 'csv-parse';
import path from 'path';

interface SourceRow {
  vimeoConnectionId: string;
  strategyCategories: string;
  strategyName: string;
  lacrosseLabLink: string;
  description: string;
  embedCode: string;
}

interface TargetRow {
  name: string;
  vimeoConnectionToMap: string;
  referenceId: string;
  strategyCategories: string;
  strategyName: string;
  lacrosseLabLink: string;
  description: string;
  embedCode: string;
}

interface ConsolidatedStrategy {
  name: string;
  vimeoConnectionToMap: string;
  referenceId: string;
  strategyCategories: string;
  strategyName: string;
  lacrosseLabUrls: string[];
  descriptions: string[];
  embedCodes: string[];
}

async function parseCSV<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = [];
    fs.createReadStream(filePath)
      .pipe(parse({ 
        columns: true, 
        skip_empty_lines: true,
        relax_quotes: true,
        relax_column_count: true,
        bom: true
      }))
      .on('data', (data) => results.push(data))
      .on('error', reject)
      .on('end', () => resolve(results));
  });
}

async function executeStrategyMapping() {
  console.log('🎯 Starting POWLAX Strategy Mapping Process...\n');

  // File paths
  const sourceFile = path.join(__dirname, "../docs/Wordpress CSV's/Strategies and Concepts to LL/Take-The-Info-From-This-CSV.csv");
  const targetFile = path.join(__dirname, "../docs/Wordpress CSV's/Strategies and Concepts to LL/Map-the-strategy-info-to-This-CSV.csv");
  const outputFile = path.join(__dirname, "../docs/Wordpress CSV's/Strategies and Concepts to LL/CONSOLIDATED-Strategy-Mapping.csv");

  try {
    // Step 1: Read both CSV files
    console.log('📖 Reading CSV files...');
    const sourceData = await parseCSV<any>(sourceFile);
    const targetData = await parseCSV<any>(targetFile);

    console.log(`✅ Source file: ${sourceData.length} rows`);
    console.log(`✅ Target file: ${targetData.length} rows\n`);

    // Step 2: Clean and prepare source data
    console.log('🧹 Cleaning source data...');
    const cleanSourceData = sourceData.filter(row => {
      // Filter out empty rows and skills/other content at bottom
      const hasStrategyName = row['Strategy Name'] && row['Strategy Name'].trim();
      const hasLacrosseLabLink = row['Lacrosse Lab Link'] && row['Lacrosse Lab Link'].trim();
      const hasVimeoId = row['Vimeo Connection ID'] && row['Vimeo Connection ID'].trim();
      
      return hasStrategyName && (hasLacrosseLabLink || hasVimeoId);
    });

    console.log(`✅ Cleaned source data: ${cleanSourceData.length} valid rows\n`);

    // Step 3: Create lookup maps
    console.log('🗺️  Creating lookup maps...');
    
    // Group source data by Reference ID
    const sourceByRefId = new Map<string, any[]>();
    // Group source data by Strategy Name
    const sourceByStrategyName = new Map<string, any[]>();

    cleanSourceData.forEach(row => {
      const refId = row['Vimeo Connection ID']?.toString().trim();
      const strategyName = row['Strategy Name']?.trim();

      if (refId) {
        if (!sourceByRefId.has(refId)) {
          sourceByRefId.set(refId, []);
        }
        sourceByRefId.get(refId)!.push(row);
      }

      if (strategyName) {
        if (!sourceByStrategyName.has(strategyName)) {
          sourceByStrategyName.set(strategyName, []);
        }
        sourceByStrategyName.get(strategyName)!.push(row);
      }
    });

    console.log(`✅ Reference ID groups: ${sourceByRefId.size}`);
    console.log(`✅ Strategy Name groups: ${sourceByStrategyName.size}\n`);

    // Step 4: Process target rows (keep in same position)
    console.log('🎯 Processing target rows...');
    const consolidatedRows: ConsolidatedStrategy[] = [];
    const matchedSourceRows = new Set<any>();

    for (let i = 0; i < targetData.length; i++) {
      const targetRow = targetData[i];
      const refId = targetRow['Vimeo Connection to Map']?.toString().trim();
      const targetName = targetRow['name']?.trim();

      let matchedSources: any[] = [];

      // Primary match: by Reference ID
      if (refId && sourceByRefId.has(refId)) {
        matchedSources = sourceByRefId.get(refId)!;
        matchedSources.forEach(source => matchedSourceRows.add(source));
        console.log(`✓ Matched by Ref ID ${refId}: ${matchedSources.length} URLs for "${targetName}"`);
      }
      // Secondary match: by Strategy Name
      else if (targetName && sourceByStrategyName.has(targetName)) {
        matchedSources = sourceByStrategyName.get(targetName)!;
        matchedSources.forEach(source => matchedSourceRows.add(source));
        console.log(`✓ Matched by Name "${targetName}": ${matchedSources.length} URLs`);
      }

      // Consolidate data
      const lacrosseLabUrls = matchedSources
        .map(source => source['Lacrosse Lab Link'])
        .filter(url => url && url.trim())
        .map(url => url.trim());

      const descriptions = matchedSources
        .map(source => source['description'])
        .filter(desc => desc && desc.trim())
        .map(desc => desc.trim());

      const embedCodes = matchedSources
        .map(source => source['Paste Embed Code in This Column'])
        .filter(code => code && code.trim())
        .map(code => code.trim());

      const strategyCategories = matchedSources.length > 0 
        ? matchedSources[0]['Strategy Categories'] || ''
        : '';

      const strategyName = matchedSources.length > 0 
        ? matchedSources[0]['Strategy Name'] || targetName
        : targetName;

      consolidatedRows.push({
        name: targetName || '',
        vimeoConnectionToMap: refId || '',
        referenceId: refId || '',
        strategyCategories: strategyCategories,
        strategyName: strategyName || '',
        lacrosseLabUrls: [...new Set(lacrosseLabUrls)], // Remove duplicates
        descriptions: [...new Set(descriptions)],
        embedCodes: [...new Set(embedCodes)]
      });
    }

    console.log(`✅ Processed ${consolidatedRows.length} target rows\n`);

    // Step 5: Add unmatched source rows
    console.log('➕ Adding unmatched source rows...');
    const unmatchedSources = cleanSourceData.filter(source => !matchedSourceRows.has(source));

    // Group unmatched by strategy name to avoid duplicates
    const unmatchedByStrategy = new Map<string, any[]>();
    unmatchedSources.forEach(source => {
      const strategyName = source['Strategy Name']?.trim();
      if (strategyName) {
        if (!unmatchedByStrategy.has(strategyName)) {
          unmatchedByStrategy.set(strategyName, []);
        }
        unmatchedByStrategy.get(strategyName)!.push(source);
      }
    });

    unmatchedByStrategy.forEach((sources, strategyName) => {
      const lacrosseLabUrls = sources
        .map(source => source['Lacrosse Lab Link'])
        .filter(url => url && url.trim())
        .map(url => url.trim());

      const descriptions = sources
        .map(source => source['description'])
        .filter(desc => desc && desc.trim())
        .map(desc => desc.trim());

      const embedCodes = sources
        .map(source => source['Paste Embed Code in This Column'])
        .filter(code => code && code.trim())
        .map(code => code.trim());

      consolidatedRows.push({
        name: strategyName,
        vimeoConnectionToMap: sources[0]['Vimeo Connection ID'] || '',
        referenceId: sources[0]['Vimeo Connection ID'] || '',
        strategyCategories: sources[0]['Strategy Categories'] || '',
        strategyName: strategyName,
        lacrosseLabUrls: [...new Set(lacrosseLabUrls)],
        descriptions: [...new Set(descriptions)],
        embedCodes: [...new Set(embedCodes)]
      });

      console.log(`✓ Added unmatched strategy: "${strategyName}" with ${lacrosseLabUrls.length} URLs`);
    });

    console.log(`✅ Added ${unmatchedByStrategy.size} unmatched strategies\n`);

    // Step 6: Generate output CSV
    console.log('📝 Generating consolidated CSV...');
    
    const csvHeader = 'name,Vimeo Connection to Map,Reference ID,Strategy Categories,Strategy Name,Lacrosse Lab Link (JSONB Array),description (Combined),Paste Embed Code in This Column (JSONB Array)\n';
    
    const csvRows = consolidatedRows.map(row => {
      const lacrosseLabJsonb = JSON.stringify(row.lacrosseLabUrls);
      const descriptionsText = row.descriptions.join(' | ');
      const embedCodesJsonb = JSON.stringify(row.embedCodes);

      return [
        `"${row.name.replace(/"/g, '""')}"`,
        `"${row.vimeoConnectionToMap}"`,
        `"${row.referenceId}"`,
        `"${row.strategyCategories.replace(/"/g, '""')}"`,
        `"${row.strategyName.replace(/"/g, '""')}"`,
        `"${lacrosseLabJsonb.replace(/"/g, '""')}"`,
        `"${descriptionsText.replace(/"/g, '""')}"`,
        `"${embedCodesJsonb.replace(/"/g, '""')}"`
      ].join(',');
    });

    const finalCsv = csvHeader + csvRows.join('\n');

    // Write output file
    fs.writeFileSync(outputFile, finalCsv);

    console.log('🎉 Strategy mapping completed successfully!\n');
    console.log(`📊 Final Results:`);
    console.log(`   • Total consolidated rows: ${consolidatedRows.length}`);
    console.log(`   • Original target rows: ${targetData.length} (preserved in same position)`);
    console.log(`   • Additional unmatched strategies: ${unmatchedByStrategy.size}`);
    console.log(`   • Output file: ${outputFile}\n`);

    // Show sample of results
    console.log('📋 Sample Results:');
    consolidatedRows.slice(0, 5).forEach((row, index) => {
      console.log(`${index + 1}. "${row.strategyName}" → ${row.lacrosseLabUrls.length} URLs`);
    });

    console.log('\n✅ Ready for Supabase import! 🚀');

  } catch (error) {
    console.error('❌ Error during strategy mapping:', error);
    process.exit(1);
  }
}

// Execute the mapping
executeStrategyMapping();