// src/lib/scormParser.js
import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';

export class SCORMPackageParser {
  constructor(file) {
    this.file = file;
    this.manifest = null;
    this.packageData = {};
  }

  async parse() {
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(this.file);
      
      // Find and parse imsmanifest.xml
      const manifestFile = contents.file('imsmanifest.xml');
      if (!manifestFile) {
        throw new Error('Invalid SCORM package: imsmanifest.xml not found');
      }

      const manifestXml = await manifestFile.async('string');
      const manifest = await this.parseManifest(manifestXml);
      
      this.manifest = manifest;
      this.packageData = await this.extractPackageData(manifest, contents);
      
      return {
        isValid: true,
        manifest: this.manifest,
        packageData: this.packageData
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  async parseManifest(xmlString) {
    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        textNodeName: '#text',
        parseAttributeValue: true,
        parseNodeValue: true,
        parseTrueNumberOnly: false,
        arrayMode: false
      });
      
      return parser.parse(xmlString);
    } catch (error) {
      throw new Error(`Failed to parse manifest XML: ${error.message}`);
    }
  }

  async extractPackageData(manifest, zipContents) {
    const packageData = {
      identifier: manifest.manifest['@_identifier'],
      version: this.detectSCORMVersion(manifest),
      title: this.extractTitle(manifest),
      organizations: manifest.manifest.organizations,
      resources: manifest.manifest.resources.resource,
      launchUrl: null
    };

    // Find launch URL
    const defaultOrg = packageData.organizations.organization;
    if (defaultOrg && defaultOrg.item) {
      const firstItem = Array.isArray(defaultOrg.item) ? defaultOrg.item[0] : defaultOrg.item;
      const resourceRef = firstItem['@_identifierref'];
      
      if (resourceRef && packageData.resources) {
        const resources = Array.isArray(packageData.resources) ? packageData.resources : [packageData.resources];
        const launchResource = resources.find(r => r['@_identifier'] === resourceRef);
        if (launchResource) {
          packageData.launchUrl = launchResource['@_href'];
        }
      }
    }

    return packageData;
  }

  detectSCORMVersion(manifest) {
    const metadata = manifest.manifest.metadata;
    if (metadata && metadata.schemaversion) {
      return metadata.schemaversion.includes('2004') ? '2004' : '1.2';
    }
    return '1.2'; // Default fallback
  }

  extractTitle(manifest) {
    const metadata = manifest.manifest.metadata;
    if (metadata && metadata.lom && metadata.lom.general && metadata.lom.general.title) {
      const title = metadata.lom.general.title.langstring;
      return title['#text'] || title;
    }
    
    const orgs = manifest.manifest.organizations;
    if (orgs && orgs.organization && orgs.organization.title) {
      return orgs.organization.title;
    }
    
    return 'Untitled SCORM Package';
  }
}