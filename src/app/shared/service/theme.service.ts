/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { Injectable } from '@angular/core';
import { mapStyle } from './map-data.service';
import { UtilService } from './util.service';
import { StorageService } from './storage.service';
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  constructor(private util: UtilService, private storage: StorageService) {}

  setTheme(theme?: any) {
    const chartColorGradients = [
      'db',
      'c2',
      'ab',
      '8c',
      '7a',
      '66',
      '52',
      '3d',
      '2e',
      '1f',
    ];
    const root = document.documentElement;
    const graphColors: string[] = [];
    if (theme) {
      const { colour_primary_alpha, colour_font_alpha, colour_map_background } =
        theme;
      this.updateMapStyles(colour_map_background);

      chartColorGradients.forEach(color => {
        graphColors.push(colour_primary_alpha + color);
      });
      chartColorGradients.forEach(color => {
        graphColors.push(colour_font_alpha + color);
      });
      theme.graphColors = graphColors;
      this.storeTheme(theme);
      this.updateCSSVariables(root, theme);
    } else {
      this.updateMapStyles('#C5EDFA');
      chartColorGradients.forEach(color => {
        graphColors.push('#4dcaf4' + color);
      });
      const defaultTheme: Theme = {
        colour_primary_alpha: '#4dcaf4',
        colour_primary_beta: '#92ddf6',
        colour_primary_delta: '#ddf3ff',
        colour_secondary: '#EA2553',
        colour_font_alpha: '#003a60',
        colour_font_beta: '#5691ae',
        colour_border_alpha: '#e5ebef',
        colour_border_beta: '#F1F4F6',
        colour_font_negative: '#003a60',
        colour_map_background: '#C5EDFA',
        colour_map_clustor: '#5691AE',
        colour_map_marker: '#003A60',
        colour_map_selected: '#EA2553',
        colour_map_marker_text: '#EA2553',
        colour_sidebar: '#92ddf6',
        graphColors: graphColors,
      };
      this.updateCSSVariables(root, defaultTheme);
      this.storeTheme(defaultTheme);
    }
  }

  private updateMapStyles(color: string) {
    mapStyle[1].stylers[0] = { color };
    mapStyle[2].stylers[0] = { color };
  }

  private updateCSSVariables(root: HTMLElement, theme: Theme) {
    const {
      colour_primary_alpha,
      colour_primary_beta,
      colour_primary_delta,
      colour_secondary,
      colour_font_alpha,
      colour_font_negative,
      colour_font_beta,
      colour_border_alpha,
      colour_border_beta,
      colour_map_background,
      colour_map_clustor,
      colour_map_marker,
      colour_map_selected,
      colour_map_marker_text,
      colour_sidebar,
    } = theme;
    root.style.setProperty('--color-primary-1', colour_primary_alpha);
    root.style.setProperty('--color-primary-2', colour_primary_beta);
    root.style.setProperty('--color-primary-3', colour_primary_delta);
    root.style.setProperty('--color-primary-4', colour_primary_delta);
    root.style.setProperty('--color-secondary', colour_secondary);

    root.style.setProperty('--font-color', colour_font_alpha);
    root.style.setProperty('--font-color-2', colour_font_beta);
    root.style.setProperty('--color-sidebar-secondary', colour_font_negative);

    root.style.setProperty('--border-color', colour_border_alpha);
    root.style.setProperty('--border-color2', colour_border_beta);

    root.style.setProperty('--map-bg-color', colour_map_background);
    root.style.setProperty('--map-clustor-color', colour_map_clustor);
    root.style.setProperty('--map-marker', colour_map_marker);
    root.style.setProperty('--map-selected', colour_map_selected);
    root.style.setProperty('--marker-text', colour_map_marker_text);
    root.style.setProperty('--color-sidebar-light', colour_sidebar);

    root.style.setProperty('--ts-primary', colour_primary_alpha);
    root.style.setProperty('--ts-primary-2', colour_primary_beta);
    root.style.setProperty('--ts-primary-3', colour_primary_delta);
    root.style.setProperty('--ts-primary-4', colour_primary_delta);
    root.style.setProperty('--ts-secondary', colour_secondary);
    root.style.setProperty('--ts-font-1', colour_font_alpha);
    root.style.setProperty('--ts-font-2', colour_font_beta);
    root.style.setProperty('--ts-border', colour_border_alpha);
    root.style.setProperty('--ts-font-3', colour_font_negative);
    root.style.setProperty('--ts-map-bg', colour_map_background);
    root.style.setProperty('--ts-map-clustor', colour_map_clustor);
    root.style.setProperty('--ts-map-marker', colour_map_marker);
    root.style.setProperty('--ts-map-selected', colour_map_selected);
    root.style.setProperty('--ts-map-font', colour_map_marker_text);
  }

  storeTheme(theme: Theme): void {
    this.util.theme = theme;
    const companyTheme = JSON.stringify(theme);
    this.storage.saveInStorage('company-theme', companyTheme);
  }
}

interface Theme {
  colour_primary_alpha: string;
  colour_primary_beta: string;
  colour_primary_delta: string;
  colour_secondary: string;
  colour_font_alpha: string;
  colour_font_beta: string;
  colour_border_alpha: string;
  colour_border_beta: string;
  colour_font_negative: string;
  colour_map_background: string;
  colour_map_clustor: string;
  colour_map_marker: string;
  colour_map_selected: string;
  colour_map_marker_text: string;
  colour_sidebar: string;
  graphColors?: string[];
}
